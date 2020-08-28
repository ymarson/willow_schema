const graphql = require("graphql");
const graphqlisodate = require("graphql-iso-date");
const Sequelize = require("sequelize");
//TODO manually generate these. used to assemble the JSON
const { GraphQLFloat, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLBoolean } = graphql;
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = graphqlisodate;

//start types

const CustomerType = new GraphQLObjectType({
  name: 'Customer',
  description: 'the description',
  fields () {
    return {
     id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
     first_name: {
      type: GraphQLString,
      resolve (c) {
        return c.first_name;
      }
    },
     last_name: {
      type: GraphQLString,
      resolve (c) {
        return c.last_name;
      }
    },
     tier_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.tier_id;
      }
    },
     created_date: {
      type: GraphQLDate,
      resolve (c) {
        return new Date(c.created_date);
      }
    }
    messages: {
      type: GraphQLList(MessageType),
      resolve (c) {
        return c.getMessages();
      }
    }
});
const MessageType = new GraphQLObjectType({
  name: 'Message',
  description: 'the description',
  fields () {
    return {
     id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
     customer_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.customer_id;
      }
    },
     body: {
      type: GraphQLString,
      resolve (c) {
        return c.body;
      }
    },
     inout: {
      type: GraphQLInt,
      resolve (c) {
        return c.inout;
      }
    },
     message_type_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.message_type_id;
      }
    },
     created_date: {
      type: GraphQLDate,
      resolve (c) {
        return new Date(c.created_date);
      }
    }
    customer: {
      type: GraphQLList(CustomerType),
      resolve (c) {
        return c.getCustomer();
      }
    }
});
const ToyType = new GraphQLObjectType({
  name: 'Toy',
  description: 'the description',
  fields () {
    return {
     id: {
      type: GraphQLString,
      resolve (c) {
        return c.id;
      }
    },
     name: {
      type: GraphQLString,
      resolve (c) {
        return c.name;
      }
    }

});
const MovieType = new GraphQLObjectType({
  name: 'Movie',
  description: 'the description',
  fields () {
    return {
     id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
     name: {
      type: GraphQLString,
      resolve (c) {
        return c.name;
      }
    }

});

//end types

//start exports

exports.CustomerType  = CustomerType; 
exports.MessageType  = MessageType; 
exports.ToyType  = ToyType; 
exports.MovieType  = MovieType; 

//end exports

