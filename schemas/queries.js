const { GraphQLString, GraphQLObjectType, GraphQLInt, GraphQLID, GraphQLList } = require("graphql");
//start imports


//end imports

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  type: "Query",
  fields: {

//start queries


//end queries
  },
});

exports.query = RootQuery;
