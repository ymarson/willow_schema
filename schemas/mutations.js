
const graphql = require('graphql');
const Sequelize = require('sequelize')
const { Customer } = require('../db');
const { Toy } = require('../db');
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList } = graphql;

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
   },
    addMessage: {
      type: MessageType,
       args: {
        name: { type: GraphQLString }
       },
       resolve(parentValue, args) {
        Message.create({id: args['id'], customer_id: args['customer_id'], body: args['body'], inout: args['inout'], message_type_id: args['message_type_id'], created_date: Sequelize.fn('NOW')});
       }
   },
    addToy: {
      type: ToyType,
       args: {
        name: { type: GraphQLString }
       },
       resolve(parentValue, args) {
        Toy.create({id: args['id'], name: args['name']});
       }
   },
    addMovie: {
      type: MovieType,
       args: {
        name: { type: GraphQLString }
       },
       resolve(parentValue, args) {
        Movie.create({id: args['id'], name: args['name']});
       }
    }

  }
});



exports.mutation = RootMutation;
//end mutation