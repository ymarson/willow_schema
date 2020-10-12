
const graphql = require('graphql');
const Sequelize = require('sequelize')
const graphqlisodate = require('graphql-iso-date');
//const { GraphQLDate, GraphQLTime, GraphQLDateTime } = graphqlisodate;
//start imports


//end imports

//start mutation

const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  type: 'Mutation',
  fields: {
    
  }
});



exports.mutation = RootMutation;
//end mutation
