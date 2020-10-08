
var fs = require('fs');
var YAML = require('yamljs');


var config = YAML.parse(fs.readFileSync('base.yaml', 'utf8'));
var db_buffer = fs.readFileSync('db.js', 'utf8');
//console.log(db_buffer);
var type_map = { 'Int': 'INTEGER', 'Float': 'FLOAT', 'String': 'STRING', 'Date': 'DATE', 'Boolean': 'BOOLEAN', 'String5000': 'STRING(5000)' };

var buffer = ""; 
var relations = config.Relations;
var exportsBuffer = ""; 

var associations = config.Associations;
var associationsBuffer = "";

var _ = require('lodash');
var execSync = require('child_process').execSync;
var yargs = require('yargs');

for (var x = 0; x < relations.length; x++) {

   var currentRelation = relations[x];
   var relationName = Object.keys(currentRelation)[0];
   var overridName = currentRelation[ relationName ].override_name;
   var overridTable = currentRelation[ relationName ].override_table;
   var override = null;
   override = overridName || overridTable;
   if (override) {
      buffer += "const " + relationName + " = conn.define('" + override + "', {\n";
   } else {
      buffer += "const " + relationName + " = conn.define('" + camel_case(relationName) + "', {\n";
   }


   var cols = "";
   var has_id = false; 

   for (var i = 0; i < currentRelation[ relationName ].columns.length; i++) {
    var original = currentRelation[ relationName ].columns[i].split(" ");
    original[0] = original[0].substring(0, original[0].length - 1);
  
    name = original[0];
    type = original[1];
    
    //extra logic for IDs //
    if ( name == 'id') {
      has_id = true;
      column = "  " + name + ": {\n\ttype: Sequelize." + type_map[type] + ", \n\tautoIncrement: true" + ", \n\tprimaryKey: true, \n\tallowNull: false\n  }, \n";
      cols += column;
      
    } else if (type === "StringN") {
      column = "  " + name + ": {\n\ttype: Sequelize.";
      cols += column;
    } else {
      //get rid of last comma:
      if (i === currentRelation[ relationName ].columns.length - 1) {
        column = "  " + name + ": {\n\ttype: Sequelize." + type_map[type] + ", \n\tallowNull: false\n   } \n";
      } else {
         column = "  " + name + ": {\n\ttype: Sequelize." + type_map[type] + ", \n\tallowNull: false\n  }, \n"; 
      }
      
      cols += column;
    }

  }

  buffer += cols + " \n}); \n";
  if (!has_id) {
    buffer += relationName + ".removeAttribute('id');\n";
  }
  buffer += "\n";

  exportsBuffer += "exports." + relationName + " = " + relationName + "; \n";
  
}

for (var x = 0; x < associations.length; x++) {  
    var currentAssociation = associations[x];
    var associationName = Object.keys(currentAssociation)[0];
    var temp = currentAssociation[ associationName ][0];
    var aggType = temp.split(": ")[0];
    var attraction = temp.split(": ")[1];

    if (aggType === 'hasMany') {
      associationsBuffer += associationName + "." + aggType + "(" + attraction + ", {\n\tas: '" + make_plural(camel_case(attraction)) + "',\n\tforeignKey: '" + camel_case(associationName) + "_id',\n\tsourceKey: 'id'\n});\n";
      //console.log(aggType)
    } else if (aggType === 'belongsTo') {
        associationsBuffer += associationName + "." + aggType + "(" + attraction + ", {\n\tas: '" + camel_case(attraction) + "',\n\tforeignKey: '" + camel_case(associationName) + "_id',\n\tsourceKey: 'id'\n});\n";
    } else {
      associationsBuffer += associationName + "." + aggType + "(" + attraction + ", {\n\tas: '" + make_plural(camel_case(attraction)) + "',\n\through: '" + camel_case(associationName) + "_" + camel_case(attraction) + "',\n\tforeignKey: '" + camel_case(associationName) + "_id',\n\tsourceKey: 'id'\n});\n";
    }
    
    
}

//console.log(buffer)
//console.log(exportsBuffer)
//console.log(associationsBuffer);

db_buffer = db_buffer.replace(/(?<=\/\/start relations\n\n).*(?=\n\/\/end relations)/sg, buffer);

db_buffer = db_buffer.replace(/(?<=\/\/start exports\n\n).*(?=\n\/\/end exports)/sg, exportsBuffer);

db_buffer = db_buffer.replace(/(?<=\/\/start associations\n\n).*(?=\n\/\/end associations)/sg, associationsBuffer);

//console.log(db_buffer);
fs.writeFileSync('db.js', db_buffer);


//writing the types.js file
var types_buffer = fs.readFileSync('schemas/types.js', 'utf8');
var tBuffer = "";
var tExportsBuffer = "\n";
for (var x = 0; x < relations.length; x++) {
  var currentRelation = relations[x];
  var relationName = Object.keys(currentRelation)[0];

  tBuffer += "\nconst " + relationName + "Type = new GraphQLObjectType({\n  name: '" + relationName + "',\n  description: 'the description',\n  fields () {\n    return {\n";

  for (var i = 0; i < currentRelation[ relationName ].columns.length; i++) {
    var original = currentRelation[ relationName ].columns[i].split(" ");
    original[0] = original[0].substring(0, original[0].length - 1);
    name = original[0];
    type = original[1];

    tBuffer += "     " + name + ": {\n      type: " + graphQL_equivalent(type) + ",\n    " + resolve_block_types(name, type);

    tBuffer += "\n    },\n";

    // if (i === currentRelation[ relationName ].columns.length - 1) {
    //   tBuffer += "\n    }\n";
    // } else {
    //   tBuffer += "\n    },\n";
    // }

  }

  // //check associations, hasMany, belongsTo
  var matchingAssociation = null;

  for (var l = 0; l < associations.length; l++) {
    if (get_matching_association(relationName, associations[l])) {
      matchingAssociation = associations[l];
      break;
    }
  }

  if (matchingAssociation) {
    let matchingRelationName = matchingAssociation[ relationName ].toString().split(': ')[1];
    if (matchingAssociation[ relationName ].toString().includes('hasMany')) {
      tBuffer += "    " + make_plural(camel_case(matchingRelationName)) + ": {\n      type: GraphQLList(" + append_type(matchingRelationName) + "),\n";
      tBuffer += "      resolve (c) {\n        return c.get" + make_plural(matchingRelationName) + "();\n      }\n    }";
    } else if (matchingAssociation[ relationName ].toString().includes('belongsTo')) {
      tBuffer += "    " + camel_case(matchingRelationName) + ": {\n      type: GraphQLList(" + append_type(matchingRelationName) + "),\n";
      tBuffer += "      resolve (c) {\n        return c.get" + matchingRelationName + "();\n      }\n    }";    
  }
 } else {
  //tBuffer += "\n" DELETE the last comma
  tBuffer = tBuffer.replace(/,\s*$/, "");
 }

 tBuffer += "\n  }; \n}\n});\n";

 tExportsBuffer += "exports." + relationName + "Type  = " + relationName + "Type; \n\n";

}

// //console.log(tBuffer);

types_buffer = types_buffer.replace(/(?<=\/\/start types\n\n).*(?=\n\/\/end types)/sg, tBuffer);

types_buffer = types_buffer.replace(/(?<=\/\/start exports\n\n).*(?=\n\/\/end exports)/sg, tExportsBuffer);

fs.writeFileSync('schemas/types.js', types_buffer);

// //writing queries.js
var queries_buffer = fs.readFileSync('schemas/queries.js', 'utf8');
var qBuffer = "\n";
var qImportsBuffer = "\n";
var firstImports = '';
var secondImports = '';

for (var x = 0; x < relations.length; x++) {
  var currentRelation = relations[x];
  var relationName = Object.keys(currentRelation)[0];

  firstImports += " " + relationName;
  secondImports += " " + append_type(relationName);
  
  qBuffer += make_plural(camel_case(relationName)) + ": {\n  type: new GraphQLList(" + append_type(relationName) + "),\n  args: { },\n";
  qBuffer += resolve_block_queries(relationName) + "\n}";

  if (currentRelation[ relationName ].queries.includes('by-pk')) {
    qBuffer += ",\n" + camel_case(relationName) + ": {\n  type: " + append_type(relationName) + ",\n  args: { id: { type: GraphQLID } },\n  ";
    qBuffer += "resolve(parentValue, args) {\n    return " + relationName + ".findByPk(args['id']);\n  }\n}\n";
  }

  if (currentRelation[ relationName ].queries.includes('all-product_version_id')) {
    qBuffer += ",\n" + make_plural(camel_case(relationName)) + "_By_product_version_id: {\n  type: new GraphQLList(" + append_type(relationName) + "),\n";
    qBuffer += "  args: { product_version_id: { type: GraphQLID } },\n  resolve(parentValue, args) {\n    return " + relationName + ".findAll( { where: args} );\n  }\n}\n"; 
  }

  if (currentRelation[ relationName ].queries.includes('byone-customer_id')) {
    //console.log('byone-customer_id query here')
  }

  if (currentRelation[ relationName ].queries.includes('all-condition_id')) {
    //console.log('all-condition_id query here')
  }

  if (x !== relations.length - 1) {
      firstImports += ",";
      secondImports += ",";
      qBuffer += ",\n";
  }

}

qImportsBuffer = "const {" + firstImports + " } = require('../db');" ;
qImportsBuffer += "\nconst {" + secondImports + " } = require('./types');\n";

// //console.log(qBuffer)
queries_buffer = queries_buffer.replace(/(?<=\/\/start imports\n\n).*(?=\n\/\/end imports)/sg, qImportsBuffer);
queries_buffer = queries_buffer.replace(/(?<=\/\/start queries\n\n).*(?=\n\/\/end queries)/sg, qBuffer);

fs.writeFileSync('schemas/queries.js', queries_buffer);

// //writing mutations.js file
var mutations_buffer = fs.readFileSync('schemas/mutations.js', 'utf8');
var mBuffer = "\n";
var mImportsBuffer = "\n";

mBuffer = "const RootMutation = new GraphQLObjectType({\n  name: 'RootMutationType',\n  type: 'Mutation',\n  fields: {\n";

for (var x = 0; x < relations.length; x++) {
  var currentRelation = relations[x];
  var relationName = Object.keys(currentRelation)[0];

  mBuffer += "    add" + relationName + ": {\n      type: " + append_type(relationName) + ",\n       args: {\n"
  for (var i = 0; i < currentRelation[ relationName ].columns.length; i++) {
    var original = currentRelation[ relationName ].columns[i].split(" ");
    original[0] = original[0].substring(0, original[0].length - 1);
    name = original[0];
    type = original[1];

    if (!name.includes('date')) {
      //console.log('no date in me ', name)
      mBuffer += "        " + name + ": { type: " + graphQL_equivalent(type) + " }";

      if (i !== currentRelation[ relationName ].columns.length - 1) {
        mBuffer += ",\n" 
      } else {
        mBuffer += "\n" //LINE NOT WORKING for some reason
      }
    }
  }
  mBuffer = mBuffer.replace(/,\s*$/, "\n"); //TEMP FIX for line not working for some reason
  
  //mBuffer += "        name: { type: GraphQLString }\n       },\n";
  mBuffer += "       },\n";
  mBuffer += "       resolve(parentValue, args) {\n"; 

  var cols = [];
  for (var i = 0; i < currentRelation[ relationName ].columns.length; i++) {
    var original = currentRelation[ relationName ].columns[i].split(" ");
    original[0] = original[0].substring(0, original[0].length - 1);
    name = original[0];
    cols.push(name);    
  }

  mBuffer += "        " + resolve_block_mutations(relationName, cols);
  mBuffer += "\n       }";

  if (x !== relations.length - 1) {
    mBuffer += "\n   },\n";
  } else {
    mBuffer += "\n    }\n";
  }

  

}

mBuffer += "\n  }\n});\n\n";
mBuffer += "\n\nexports.mutation = RootMutation;\n";

mImportsBuffer = "\nconst { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList, GraphQLDate } = graphql;";

mImportsBuffer += "\nconst { ";

for (var x = 0; x < relations.length; x++) {
  var currentRelation = relations[x];
  var relationName = Object.keys(currentRelation)[0];

  mImportsBuffer += relationName;

  if (x !== relations.length - 1) {
    mImportsBuffer += ", ";
  }
}

mImportsBuffer += " } = require('../db');";
mImportsBuffer += "\nconst { ";

for (var x = 0; x < relations.length; x++) {
  var currentRelation = relations[x];
  var relationName = Object.keys(currentRelation)[0];

  mImportsBuffer += relationName + "Type";

  if (x !== relations.length - 1) {
    mImportsBuffer += ", ";
  }
}

mImportsBuffer += " } = require('./types');\n";

//console.log('mImportsBuffer: \n' + mImportsBuffer);


mutations_buffer = mutations_buffer.replace(/(?<=\/\/start imports\n\n).*(?=\n\/\/end imports)/sg, mImportsBuffer);
//console.log('mBuffer:\n' + mBuffer);
//console.log('mImports' + mImportsBuffer);
mutations_buffer = mutations_buffer.replace(/(?<=\/\/start mutation\n\n).*(?=\n\/\/end mutation)/sg, mBuffer);

//console.log('mutations_buffer:\n' + mutations_buffer)
fs.writeFileSync('schemas/mutations.js', mutations_buffer);

//🥶TODO: check if argument has been passed if user wants to migrate

// //migrations
// //🥶TODO: create a baseOld file if it doesn't exist. TEST this
const argv = yargs
    .command('willow-generate', 'Tells us to generate the schema', {
        migrate: {
            description: 'gives us approval to migrate',
            // alias: 'y',
            type: 'boolean',
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv['migrate']) {
  console.log('creating migrations');

  var oldConfig = YAML.parse(fs.readFileSync('base_old.yaml', 'utf8'));
  if (!oldConfig) {
    fs.writeFileSync('base_old.yaml', '');
  }

  var base_rels = config.Relations;
  var base_old_rels = oldConfig.Relations;
  //console.log(base_old_rels);
  //console.log(base_rels);


  var relations_old = {};
  for (var x = 0; x < base_old_rels.length; x++) {
      var tmp_cols = {};
      var tempObj = Object.values(base_old_rels[x])[0];
      var relationName = Object.keys(base_old_rels[x])[0];
      var tempColArr = Object.values(tempObj)[0];
      console.log(tempColArr);
      for (var y = 0; y < tempColArr.length; y++) {
          var temp = tempColArr[y].split(':');
          var name = temp[0];
          var type = temp[1];
          type = type.slice(1);

          tmp_cols[ name ] = type; 
      }
      relations_old[ relationName ] = tmp_cols;
      
  }
  
  //console.log(relations_old);


  for (var i = 0; i < base_rels.length; i++) {
      var tempObj = Object.values(base_rels[i])[0];
      var relationName = Object.keys(base_rels[i])[0];
      var cols = Object.values(tempObj)[0];
      
      if (relations_old[ relationName ]) {
          //console.log('table exists');
          var tmp_old_cols = relations_old[ relationName ];
          for (var y = 0; y < cols.length; y++) {
              var temp = cols[y].split(':');
              var col_name = temp[0];
              var col_type = temp[1];
              col_type = col_type.slice(1);
              if (tmp_old_cols[ col_name ]) {
                  //console.log('column exists');

                  if ( tmp_old_cols[ col_name ] != col_type ) {
                      console.log('different type');

                      var migContent = "'use strict';\n\nmodule.exports = {\n  up: (queryInterface, Sequelize) => {\n    return queryInterface.changeColumn(";
                      migContent += "\n    '" + camel_case(relationName) + "',\n     '" + col_name + "',\n    {\n     type: Sequelize." +  col_type.toUpperCase();
                      migContent += ",\n     allowNull: true\n     }\n   )\n  },\n\n down: (queryInterface, Sequelize) => {\n    return queryInterface.changeColumn('";
                      migContent += camel_case(relationName) + "', '" + col_name + "')\n  }\n};";

                      execSync('npx sequelize-cli migration:generate --name ' + col_name);
                      var fileName = execSync('ls -r migrations/*'+ col_name + '.js | head -1');
                      fs.writeFileSync(fileName.toString().trim(), migContent);
                  }

                  delete tmp_old_cols[col_name];
              } else {
                  console.log('column ' + col_name + ' doesnt exist');

                  var migContent = "'use strict';\n\nmodule.exports = {\n  up: (queryInterface, Sequelize) => {\n    return queryInterface.addColumn(";
                  migContent += "\n    '" + camel_case(relationName) + "',\n     '" + col_name + "',\n    {\n     type: Sequelize." +  col_type.toUpperCase();
                  migContent += ",\n     allowNull: true\n     }\n   )\n  },\n\n down: (queryInterface, Sequelize) => {\n    return queryInterface.removeColumn('";
                  migContent += camel_case(relationName) + "', '" + col_name + "')\n  }\n};";

                  execSync('npx sequelize-cli migration:generate --name ' + col_name);
                  var fileName = execSync('ls -r migrations/*'+ col_name + '.js | head -1');
                  fs.writeFileSync(fileName.toString().trim(), migContent);
              }
          }
          //DELETED COLUMNS:
          console.log(tmp_old_cols);
          if (!_.isEmpty(tmp_old_cols)) {
            //console.log('this column has been deleted');
            var del_name = Object.keys(tmp_old_cols)[0];
            var del_type = Object.values(tmp_old_cols)[0];

            var migContent = "'use strict';\n\nmodule.exports = {\n  up: (queryInterface, Sequelize) => {\n    return queryInterface.removeColumn(";
            migContent += "\n     '" + camel_case(relationName) + "',\n      '" + del_name + "'\n   );\n },\n\n down: function(queryInterface, Sequelize) {\n  return queryInterface.addColumn(";
            migContent += "\n    '" + camel_case(relationName) + "',\n     '" + del_name + "',\n    {\n     type: Sequelize." +  del_type.toUpperCase();
            migContent += ",\n     allowNull: true\n    }\n  )\n }\n};";
            //console.log(migContent);

            execSync('npx sequelize-cli migration:generate --name ' + col_name);
            var fileName = execSync('ls -r migrations/*'+ col_name + '.js | head -1');
            fs.writeFileSync(fileName.toString().trim(), migContent);
          }
      } else {
        //console.log('table ' + relationName + '  doesnt exist');

        var migContent = '';
        migContent = "'use strict';\n\nmodule.exports = {\n  up: (queryInterface, Sequelize) => {\n    return queryInterface.createTable('";
        migContent += camel_case(relationName) + "', {";
        
        for (var q = 0; q < cols.length; q++) {
          var temp = cols[q].split(':');
          var name = temp[0];
          var type = temp[1];
          type = type.slice(1);
          if (type.includes("'")) {
            type = type.replace("'", "");
          }
          migContent += "\n       " + name + ": {\n        type: Sequelize." + type.toUpperCase() + ",";
          if (name.includes('id')) {
            migContent += "\n        autoIncrement: true,\n        primaryKey: true,";
          }
          migContent += "\n        allowNull: false\n      }";
          if (q < cols.length - 1) {
            migContent += ",";
          }
        }

        migContent += "\n   });\n  },\n\n  down: (queryInterface, Sequelize) => {\n    return queryInterface.dropTable('";
        migContent += camel_case(relationName) + "');\n  }\n};";

        //console.log(migContent);

        execSync('npx sequelize-cli migration:generate --name ' + camel_case(relationName));
        var fileName = execSync('ls -r migrations/*'+ camel_case(relationName) + '.js | head -1');
        fs.writeFileSync(fileName.toString().trim(), migContent);
      }
      execSync('npx sequelize-cli db:migrate');
      setTimeout(function(){ 
        console.log('copying base to base_old');
        execSync('cp base.yaml base_old.yaml'); 
      }, 5000);
      //WRITE DELTED TABLE MIGRATION here
  }
   
  //execSync('npx sequelize-cli db:migrate');
}

//console.log(argv);

//execSync('cp base.yaml base_old.yaml') //copy base.yaml to base_old.yaml



//add index





function get_matching_association(name, obj) {
  if (Object.keys(obj)[0] === name) {
    return true;
  } else {
    return false;
  }
}


function append_type(name) {
  return name + 'Type';
}

function resolve_block_mutations(name, fields) {
  var block = '';
  block = name + ".create({";
  for (var f = 0; f < fields.length; f++) {
    block += fields[f] + ": ";  
    if (fields[f] === 'created_date') {
      block += "Sequelize.fn('NOW')";
    } else {
      block += "args['" + fields[f] + "']";
    }
    
    if (f !== fields.length - 1) {
      block += ", ";
    }
  }
  block += "});";
  return block;
}

function resolve_block_queries(name) {
  return "  resolve(parentValue, args) {\n      return " + name + ".findAll();\n  }";
}

function resolve_block_types(name, type) {
  if (type === 'DateTime' || type === 'Date') {
    return "  resolve (c) {\n        return new Date(c." + name + ");\n      }";
  } else {
    return "  resolve (c) {\n        return c." + name + ";\n      }";
  }
}

function graphQL_equivalent(type) {
  return 'GraphQL' + type;
}

function make_plural(name) {
    return name + 's';
}

// function get_types_for_column(column, type) {
//   // code to be executed

// }

// function have_same_elements(array_one, array_two) {
//   // code to be executed
// }

// function snake_case(name){
  
// }

function camel_case(name){
  return name
  .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
  .replace(/\s/g, '')
  .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
}

var relations = config['Relations'];


