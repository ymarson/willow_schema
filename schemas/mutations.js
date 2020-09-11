
const graphql = require('graphql');
const Sequelize = require('sequelize')

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
