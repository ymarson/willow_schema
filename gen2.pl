use strict;
use warnings;
use YAML::XS 'LoadFile';
use Data::Dumper;
use FileHandle;
my $config = LoadFile('base.yaml');
my $old_config = LoadFile('base_old.yaml');

my %type_map = ( 'Int' => 'INTEGER', 'Float' => 'FLOAT', 'String' => 'STRING', 'Date' => 'DATE', 'Boolean' => 'BOOLEAN', 'String5000' => 'STRING(5000)' );

sub get_types_for_column {
	my $ret ="";
	my $column = shift;
	my $type = shift;
	my $null = 0;
	if ( $type =~ s/N// ){
	        $null = 1;
        }
        my $ntype = $type_map{$type};

	$ret .= "	type: Sequelize.$ntype,\n";

	if ( $column eq "id" || $column eq "hubspot_id" || $column eq "journey_id" ){
		if ( $column eq "id" ){
			$ret .= "	autoIncrement: true,\n";
		}
		$ret .= "	primaryKey: true,\n";
	}

	if ( $null ){
		$ret.= "	allowNull: true\n";
	} else {
		$ret.= "	allowNull: false\n";
	}

	return $ret;

}

sub have_same_elements {
    my ($arr1, $arr2) = @_;
    my %counts = ();
    $counts{$_} += 1 foreach (@$arr1);
    $counts{$_} -= 1 foreach (@$arr2);
    return !(grep { $_ != 0 } values %counts);
}

my $migration_skeleton_create_table = "'use strict';
  
module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('XXX', { YYY });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('XXX');
  }
};";

my $migration_skeleton_change_column = "'use strict';
  
module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.changeColumn(
      'XXX',
      'AAA',
      {
YYY
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'XXX',
      'AAA',
      {
ZZZ
      }
    );
  }
};";

my $migration_skeleton_add_column = "'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn(
    'XXX',
    'AAA',
    {
YYY
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('XXX', 'AAA')
  }
};";

my $migration_skeleton_delete_column = "'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('XXX', 'AAA')
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.addColumn(
    'XXX',
    'AAA',
    {
ZZZ
      }
    )
  },
};";

my $migration_skeleton_add_index = "'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    RRR

    return queryInterface.addIndex(
        'XXX',
        [YYY],
        {
          indexName: 'NNN',
          type: 'UNIQUE'
        }
      );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('XXX', 'NNN')
  }
};";

sub snake_case {
	#from ClassName
	my $name = shift;
	return lc(join "_", split /(?=[A-Z])/, $name);
}

sub camel_case {
	#from snake_case
	my $name = shift;	
	return lcfirst ( join "", map { ucfirst($_) } split "_", $name);
}

my $db_buffer = "";
my $fh = new FileHandle "db.js" or die;
while ( my $line = <$fh> ){
	$db_buffer .= $line;	
}
close $fh;

my $tp_buffer = "";
my $fh2 = new FileHandle "schemas/types.js" or die;
while ( my $line = <$fh2> ){
	$tp_buffer .= $line;	
}
close $fh2;

my $qr_buffer = "";
my $fh3 = new FileHandle "schemas/queries.js" or die;
while ( my $line = <$fh3> ){
	$qr_buffer .= $line;	
}
close $fh3;

my $fh_migration;

my $exports = {};

my $relations = $config->{'Relations'};
my $associations = $config->{'Associations'};
my $relations_old = $old_config->{'Relations'};
my $associations_old = $old_config->{'Associations'};

my $relations_code = "";
my $exports_code = "";
my $associations_code = "";
my $types_code = "";
my $types_exports_code = "";
my $query_code = "";
my $query_imports_code = "const { ";
my $relations_map = {};
my $relations_map_old = {};
my $migration_code = "";
my $migration_tmp = "";

foreach my $relation ( @$relations_old ){
	my $name = [keys %$relation]->[0];	
	$relations_map_old->{$name} = $relation->{$name}
}

foreach my $relation ( @$relations ){
	my $new_relation = 0;
	my $new_relation_column = 0;
	my $new_relation_change_column = 0;
	my $new_relation_index = 0;
	$migration_tmp = "";

	my $name = [keys %$relation]->[0];	
	if ( ! $relations_map_old->{$name} ){
		print "new relation " . $name . "\n";
		$new_relation = 1;
		my $cmd = "npx sequelize-cli migration:generate --name ".lc($name);
		qx($cmd);
		$cmd = "ls -rt migrations/*".lc($name).".js | head -1";
		my $migration_file_name = qx($cmd);
		chomp($migration_file_name);
		print $migration_file_name . "\n";
		$fh_migration = new FileHandle ">$migration_file_name" or die;	
		$migration_code = $migration_skeleton_create_table;
		
	}
	$relations_map->{$name} = $relation->{$name};
	$exports->{$name} = 1;
	my $override = $relation->{$name}->{'override_name'};
	my $override_table = $relation->{$name}->{'override_table'};
	if ( $override || $override_table ){
		my $tmp = $override ? $override : $override_table;
		$relations_code.= "const $name = conn.define('".$tmp ."', {\n";
		$migration_code =~ s/XXX/$tmp/g;
	} else {
		$relations_code.= "const $name = conn.define('".snake_case($name)."', {\n";
		$migration_code =~ s/XXX/&snake_case($name)/eg;
	}
	my $columns = $relation->{$name}->{'columns'};
	my $columns_hash =  { map { [keys %{$_}]->[0], [values %{$_}]->[0] } @$columns };
	my $columns_old;

	my $indices_old = $relations_map_old->{$name}->{'index'};
	if ( ! $new_relation ){
		$columns_old = $relations_map_old->{$name}->{'columns'};
		my $columns_old_hash =  { map { [keys %{$_}]->[0], [values %{$_}]->[0] } @$columns_old };

		my $new_columns = [];
		my $deleted_columns = [];
		my $changed_columns = [];

		foreach my $key	( keys %{$columns_hash} ){
			if ( $columns_old_hash->{$key} ){
				#exists; check if its the same type
				if ( $columns_hash->{$key} eq $columns_old_hash->{$key} ){
					#no action
				} else {
					#modify column
					push(@$changed_columns, [$key, $columns_hash->{$key}, $columns_old_hash->{$key} ]); 
				}
			} else {
				#lets create it
				push(@$new_columns, [$key, $columns_hash->{$key}, undef ]); 
			}

			delete $columns_old_hash->{$key};
		}  
		#everything left in $columns_old_hash should be deleted
		foreach my $key	( keys %{$columns_old_hash} ){
			push(@$deleted_columns, [$key, undef, $columns_old_hash->{$key} ]);
		}

		$indices_old = $relations_map_old->{$name}->{'index'};

		foreach my $c ( @$new_columns ){
			my ( $col, $new_type, $old_type ) = @$c;
			my $yyy = get_types_for_column($col, $new_type );
			print "new column for $name : $col of type $new_type\n";
			my $cmd = "npx sequelize-cli migration:generate --name ".lc($name)."-new_column-".$col;
			qx($cmd);
			$cmd = "ls -rt migrations/*".lc($name)."-new_column-".$col.".js | head -1";
			my $file_name = qx($cmd);
			chomp($file_name);
			print $file_name . "\n";
			my $skeleton_code = $migration_skeleton_add_column;
			my $fh_col = new FileHandle ">$file_name" or die;
			$skeleton_code =~ s/XXX/&snake_case($name)/eg;
			$skeleton_code =~ s/AAA/$col/eg;
			$skeleton_code =~ s/YYY/$yyy/g;
			print $fh_col $skeleton_code . "\n";
			close $fh_col;

		}
		
		foreach my $c ( @$deleted_columns ){
			my ( $col, $new_type, $old_type ) = @$c;
			my $zzz = get_types_for_column($col, $old_type );
			print "deleting column for $name : $col of type $old_type\n";
			my $cmd = "npx sequelize-cli migration:generate --name ".lc($name)."-delete_column-".$col;
			qx($cmd);
			$cmd = "ls -rt migrations/*".lc($name)."-delete_column-".$col.".js | head -1";
			my $file_name = qx($cmd);
			chomp($file_name);
			print $file_name . "\n";
			my $skeleton_code = $migration_skeleton_delete_column;
			my $fh_col = new FileHandle ">$file_name" or die;
			$skeleton_code =~ s/XXX/&snake_case($name)/eg;
			$skeleton_code =~ s/AAA/$col/eg;
			$skeleton_code =~ s/ZZZ/$zzz/g;
			print $fh_col $skeleton_code . "\n";
			close $fh_col;
		}
		
		foreach my $c ( @$changed_columns ){
			my ( $col, $new_type, $old_type ) = @$c;
			my $yyy = get_types_for_column($col, $new_type );
			my $zzz = get_types_for_column($col, $old_type );
			print "changing column for $name : $col from type $old_type to $new_type\n";
			my $cmd = "npx sequelize-cli migration:generate --name ".lc($name)."-change_column-".$col;
			qx($cmd);
			$cmd = "ls -rt migrations/*".lc($name)."-change_column-".$col.".js | head -1";
			my $file_name = qx($cmd);
			chomp($file_name);
			print $file_name . "\n";
			my $skeleton_code = $migration_skeleton_change_column;
			my $fh_col = new FileHandle ">$file_name" or die;
			$skeleton_code =~ s/XXX/&snake_case($name)/eg;
			$skeleton_code =~ s/AAA/$col/eg;
			$skeleton_code =~ s/ZZZ/$zzz/g;
			$skeleton_code =~ s/YYY/$yyy/g;
			print $fh_col $skeleton_code . "\n";
			close $fh_col;
		}
	}

	my $num_columns = scalar(@$columns);
	my $counter = 0;
	my $has_id = 0;
	my $col_num = 0;
	foreach my $column_row ( @$columns ){

		my $column = [ keys %$column_row ]->[0];

		$relations_code.= "  $column: {\n";
		$migration_tmp.= "  $column: {\n";
		my $null = 0;
		my $val = $column_row->{$column};
		if ( $val =~ s/N// ){
			$null = 1;
		}
		my $type = $type_map{$val};
		$relations_code.= "    type: Sequelize.$type,\n";
		$migration_tmp.= "    type: Sequelize.$type,\n";

		if ( $column eq "id" || $column eq "hubspot_id" || $column eq "journey_id" ){
			$has_id = 1;
			if ( $column eq "id" ){
				$relations_code.= "    autoIncrement: true,\n";
				$migration_tmp.= "    autoIncrement: true,\n";

			}
			$relations_code.= "    primaryKey: true,\n";
			$migration_tmp.= "    primaryKey: true,\n";

		}
		if ( $null ){
			$relations_code.= "    allowNull: true\n";
			$migration_tmp.= "    allowNull: true\n";

		} else {
			$relations_code.= "    allowNull: false\n";
			$migration_tmp.= "    allowNull: false\n";

		}

		$counter++;
		if ( $counter == $num_columns ){
			$relations_code.= "  }\n";
			$migration_tmp.= "  }\n";
		} else {
			$relations_code.= "  },\n";
			$migration_tmp.= "  },\n";
		}
		$col_num++;	
	}
	if ( $relation->{$name}->{'index'} ){

		if ( $new_relation or ( ! $relations_map_old->{$name}->{'index'} ) or ( $relations_map_old->{$name}->{'index'} && ( ! have_same_elements($relations_map->{$name}->{'index'}, $relations_map_old->{$name}->{'index'}) ) )){
			my $change_line = "";
			if ($relations_map_old->{$name}->{'index'} && ( ! have_same_elements($relations_map->{$name}->{'index'}, $relations_map_old->{$name}->{'index'}) ) ){
				print "adjusting index\n";
				my $index_name_old = &snake_case($name) . "_" . join "_", @{$relations_map_old->{$name}->{'index'}};
				$change_line = "queryInterface.removeIndex('".&snake_case($name)."', '".$index_name_old."');";

			} else {
				print "new index\n";
			}
                	my $cmd = "npx sequelize-cli migration:generate --name ".lc($name)."-new_index";
                	qx($cmd);
                	$cmd = "ls -rt migrations/*".lc($name)."-new_index.js | head -1";
                	my $migration_index_file_name = qx($cmd);
                	chomp($migration_index_file_name);
                	print $migration_index_file_name . "\n";
                	my $migration_index_code = $migration_skeleton_add_index;
                	my $fh_migration_index = new FileHandle ">$migration_index_file_name" or die;
					#TODO sometimes the name is different
                	$migration_index_code =~ s/XXX/&snake_case($name)/eg;
			my $index_fields = join ",", (map { '\''. $_ . '\'' } @{$relation->{$name}->{'index'}});
			my $index_name = &snake_case($name) . "_" . join "_", @{$relation->{$name}->{'index'}};
                	$migration_index_code =~ s/NNN/$index_name/eg;
                	$migration_index_code =~ s/YYY/$index_fields/eg;
                	$migration_index_code =~ s/RRR/$change_line/eg;
			print $fh_migration_index $migration_index_code . "\n";
			close $fh_migration_index;
		}

		my $rel =  join ",", (map { '\''. $_ . '\'' } @{$relation->{$name}->{'index'}});
		$rel = "[" . $rel . "]";
		$relations_code.= "},
{
    indexes: [
        {
            unique: true,
            fields: $rel
        }
    ]\n";
	}
	$relations_code.= "});\n";
	if ( !$has_id  ){
		$relations_code.= "$name.removeAttribute('id');\n";
	}
	$relations_code.= "\n";
	if ( $new_relation ) {
		$migration_code =~ s/YYY/$migration_tmp/g;
		print $fh_migration $migration_code . "\n";
		close $fh_migration;
	}
}

foreach my $name ( sort keys %$exports ){
	$exports_code .= "exports.".$name." = ".$name.";\n";
	$query_imports_code.= "${name}, ";
}
$query_imports_code .= "} = require(\"../db\");\n";
$query_imports_code .= "const { ";

my $additional_types = {};

foreach my $relation ( @$associations ){
	my $name = [keys %$relation]->[0];
	foreach my $association ( @{$relation->{$name}} ){

		my $type = [keys %$association]->[0];
		my $t = $association->{$type};
		my ( $target, $short_name, $through_table ) = split /\|/, $t;
		my $override_target = $relations_map->{$target}->{'override_name'};
		my $function_name = ( $override_target ) ? camel_case($override_target) : lcfirst($target);
		$function_name = $short_name if $short_name;
		my $foreign_key = ( $override_target ) ? $override_target . "_id" : snake_case($target) . "_id";
		my $foreign_key_main = snake_case($name) . "_id";
		my $id = "id";
		if ( $relations_map->{$name}->{'columns'}->[0]->{'hubspot_id'} ){
			$id = "hubspot_id";
		}	
		if ( $relations_map->{$name}->{'columns'}->[0]->{'journey_id'} ){
			$id = "journey_id";
		}
		my $target_type = $target."Type";
		#TODO massive hack!
		$target_type =~ s/TT/TypeT/g;

		if ( $type eq "belongsTo" ){
			$associations_code .= "${name}.belongsTo(${target}, { as: '".$function_name."', foreignKey: '".$foreign_key."', sourceKey: 'id' });\n";

			my $snippet = "    ".snake_case(${function_name}).": {
        type: ${target_type},
        resolve (c) {
          return c.".camel_case('get_'.$function_name)."();
        }
      },\n";
			#print $name. "\n";
			#print $snippet;next;
			push(@{$additional_types->{$name}},$snippet);
		}
		if ( $type eq "hasMany" ){
			$associations_code .= "${name}.hasMany(${target}, { as: '".$function_name."s', foreignKey: '".$foreign_key_main."', sourceKey: '".$id."' });\n";
			my $snippet = "    ".snake_case(${function_name})."s: {
        type: GraphQLList(${target_type}),
        resolve (c) {
          return c.".camel_case('get_'.$function_name)."s();
        }
      },\n";
			#print $name. "\n";
			#print $snippet;next;
			push(@{$additional_types->{$name}},$snippet);
		}
		if ( $type eq "belongsToMany" ){
			$associations_code .= "${name}.belongsToMany(${target}, { as: '".$function_name."s', through: ${through_table}, foreignKey: '".$foreign_key_main."', sourceKey: '".$id."' });\n";
			my $snippet = "    ".snake_case(${function_name})."s: {
        type: GraphQLList(${target_type}),
        resolve (c) {
          return c.".camel_case('get_'.$function_name)."s();
        }
      },\n";
			#print $name. "\n";
			#print $snippet;next;
			push(@{$additional_types->{$name}},$snippet);
		}
	}
}

my $type_exports = {};
foreach my $relation ( @$relations ){
	my $name = [keys %$relation]->[0];	
	my $class_name = $name;
	my $override = $relation->{$name}->{'override_name'};

	if ( $override ){
		$class_name = join "", map { ucfirst($_) } split "_", $override;
	}

	$types_code .= "const ${class_name}Type = new GraphQLObjectType({
  name: '".$name."',
  description: 'the description',
  fields () {
    return {\n";

	$type_exports->{$class_name} = 1;
	my $columns = $relation->{$name}->{'columns'};
	foreach my $column_row ( @$columns ){
		my $column = [ keys %$column_row ]->[0];
		my $val = $column_row->{$column};	
		$val =~ s/N$//g;
		$val =~ s/\d+$//g;
		$types_code .= "    ${column}: {\n";
		if ( $val eq "Date" ){
        		$types_code .= "      type: GraphQLDateTime,\n";
		} else {
        		$types_code .= "      type: GraphQL${val},\n";
		}
        	$types_code .= "      resolve (c) {\n";
		if ( $val eq "Date" ){
        		$types_code .= "        return new Date(c.${column});\n";
		} else {
        		$types_code .= "        return c.${column};\n";
		}
        	$types_code .= "      }\n";
      		$types_code .= "    },\n";		
	}	
	foreach my $snippet ( @{$additional_types->{$name}} ){
		$types_code .= $snippet;
	}	
		$types_code .= "    };
  }
});\n\n";


}

foreach my $name ( sort keys %$type_exports ){
	$types_exports_code .= "exports.".$name."Type = ".$name."Type;\n";
	$query_imports_code .= "${name}Type, ";
}
$query_imports_code .= "} = require(\"./types\");\n";

foreach my $relation ( @$relations ){
	my $name = [keys %$relation]->[0];	
	my $queries = $relation->{$name}->{'queries'};
	foreach my $query ( @$queries){
		my ( $by, $col) = split "-", $query;
		if ( $by eq "all" && $col ne "all"){
			$query_code .= "    ".snake_case(${name})."s_By_".snake_case($col).": {
      type: new GraphQLList(${name}Type),
      args: { ${col}: { type: GraphQLID } },
      resolve(parentValue, args) {
        return ${name}.findAll( { where: args} );
      }
    },\n";
		}
		if ( $by eq "by" && $col eq "pk" ){
			my $id = "id";
                	if ( $relations_map->{$name}->{'columns'}->[0]->{'hubspot_id'} ){
                        	$id = "hubspot_id";
                	}
					if ( $relations_map->{$name}->{'columns'}->[0]->{'journey_id'} ){
                        	$id = "journey_id";
                	}
			$query_code .= "    ".snake_case(${name}).": {
      type: ${name}Type,
      args: { ${id}: { type: GraphQLID } },
      resolve(parentValue, args) {
        return ${name}.findByPk(args['".$id."']);
       }
    },\n";
		}
		if ( $by eq "all" && $col eq "all" ){
			$query_code .= "    ".snake_case(${name})."s: {
      type: new GraphQLList(${name}Type),
      args: { },
      resolve(parentValue, args) {
        return ${name}.findAll();
     }
    },\n";
		}
		if ( $by eq "byone" && $col ne "pk" ){
			$query_code .= "    ".snake_case(${name})."_By_One".snake_case($col).": {
      type: ${name}Type,
      args: { ${col}: { type: GraphQLID } },
      resolve(parentValue, args) {
        return ${name}.findOne( { where: {  ${col}: args['".$col."']}} );
      }
    },\n";
		}
	}
}	

$db_buffer =~ s/(?<=\/\/start relations\n\n).*(?=\n\/\/end relations)/$relations_code/sg;
$db_buffer =~ s/(?<=\/\/start exports\n\n).*(?=\n\/\/end exports)/$exports_code/sg;
$db_buffer =~ s/(?<=\/\/start associations\n\n).*(?=\n\/\/end associations)/$associations_code/sg;
$tp_buffer =~ s/(?<=\/\/start types\n\n).*(?=\n\/\/end types)/$types_code/sg;
$tp_buffer =~ s/(?<=\/\/start exports\n\n).*(?=\n\/\/end exports)/$types_exports_code/sg;
$qr_buffer =~ s/(?<=\/\/start queries\n\n).*(?=\n\/\/end queries)/$query_code/sg;
$qr_buffer =~ s/(?<=\/\/start imports\n\n).*(?=\n\/\/end imports)/$query_imports_code/sg;

my $fh_write = new FileHandle ">db.js" or die;
print $fh_write $db_buffer;

my $tp_write = new FileHandle ">schemas/types.js" or die;
print $tp_write $tp_buffer;

my $qr_write = new FileHandle ">schemas/queries.js" or die;
print $qr_write $qr_buffer;
