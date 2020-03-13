const graphql = require("graphql");
const Sequelize = require("sequelize");
const { Customer } = require("../db");
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList } = graphql;
const { CustomerType } = require("./types");

const RootMutation = new GraphQLObjectType({
  name: "RootMutationType",
  type: "Mutation",
  fields: {
    addCustomer: {
      type: CustomerType,
      args: {
        hubspot_id: { type: GraphQLString },
        group_id: { type: GraphQLString },
        name: { type: GraphQLString }
      },
      resolve(parentValue, args) {
     	  //return Goal.create({hubspot_id: args['hubspot_id'], group_id: args['group_id'], name: args['name'], created_date: Sequelize.fn('NOW'), sync_date: Sequelize.fn('NOW')});
      }
    },
  }
});

exports.mutation = RootMutation;
