const { GraphQLString, GraphQLObjectType, GraphQLInt, GraphQLID, GraphQLList } = require("graphql");
//start imports

const { Customer, Message, Toy, Movie } = require('../db');
const { CustomerType, MessageType, ToyType, MovieType } = require('./types');
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
message: {
  type: MessageType,
  args: { id: { type: GraphQLID } },
  resolve(parentValue, args) {
    return Message.findByPk(args['id']);
  }
},
toys: {
  type: new GraphQLList(ToyType),
  args: { },
  resolve(parentValue, args) {
      return Toy.findAll();
  }
},
toys_By_product_version_id: {
  type: new GraphQLList(ToyType),
  args: { product_version_id: { type: GraphQLID } },
  resolve(parentValue, args) {
    return Toy.findAll( { where: args} );
  }
},
movies: {
  type: new GraphQLList(MovieType),
  args: { },
  resolve(parentValue, args) {
      return Movie.findAll();
  }
},
movies_By_product_version_id: {
  type: new GraphQLList(MovieType),
  args: { product_version_id: { type: GraphQLID } },
  resolve(parentValue, args) {
    return Movie.findAll( { where: args} );
  }
}
//end queries
  },
});

exports.query = RootQuery;
