const { GraphQLString, GraphQLObjectType, GraphQLInt, GraphQLID, GraphQLList } = require("graphql");
//start imports

const { Customer, Message, } = require("../db");
const { CustomerType, MessageType, } = require("./types");

//end imports

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  type: "Query",
  fields: {

//start queries

    customers: {
      type: new GraphQLList(CustomerType),
      args: { },
      resolve(parentValue, args) {
        return Customer.findAll();
     }
    },
    messages: {
      type: new GraphQLList(MessageType),
      args: { },
      resolve(parentValue, args) {
        return Message.findAll();
     }
    },

//end queries
  },
});

exports.query = RootQuery;
