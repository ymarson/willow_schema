const graphql = require("graphql");
const Sequelize = require("sequelize");
const {  } = require("../db");
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList } = graphql;
const {  } = require("./types");

const RootMutation = new GraphQLObjectType({
  name: "RootMutationType",
  type: "Mutation",
  fields: {
  }
});

exports.mutation = RootMutation;
