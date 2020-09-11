
const graphql = require('graphql');


//start imports


const { CustomerType } = require('./types');
const { MessageType } = require('./types');
const { ToyType } = require('./types');
const { MovieType } = require('./types');
//end imports

//start mutation

const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  type: 'Mutation',
  fields: {
    addCustomer: {
      type: CustomerType,
       args: {
        name: { type: GraphQLString }
       },
       resolve(parentValue, args) {
        Customer.create({id: args['id'], first_name: args['first_name'], last_name: args['last_name'], tier_id: args['tier_id'], created_date: Sequelize.fn('NOW')});
       }
   }
  }
});



exports.mutation = RootMutation;
//end mutation
