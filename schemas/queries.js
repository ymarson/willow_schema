const { GraphQLString, GraphQLObjectType, GraphQLInt, GraphQLID, GraphQLList } = require("graphql");
//start imports

const { Approval, Distributor, Message, Order, Organisation, Payment, Policy, PriceHistory, Reputation, User, UserT, } = require("../db");
const { ApprovalType, DistributorType, MessageType, OrderType, OrganisationType, PaymentType, PolicyType, PriceHistoryType, ReputationType, UserType, UserTType, } = require("./types");

//end imports

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  type: "Query",
  fields: {

//start queries

    users: {
      type: new GraphQLList(UserType),
      args: { },
      resolve(parentValue, args) {
        return User.findAll();
     }
    },
    organisations: {
      type: new GraphQLList(OrganisationType),
      args: { },
      resolve(parentValue, args) {
        return Organisation.findAll();
     }
    },
    reputations: {
      type: new GraphQLList(ReputationType),
      args: { },
      resolve(parentValue, args) {
        return Reputation.findAll();
     }
    },
    policys: {
      type: new GraphQLList(PolicyType),
      args: { },
      resolve(parentValue, args) {
        return Policy.findAll();
     }
    },
    approvals: {
      type: new GraphQLList(ApprovalType),
      args: { },
      resolve(parentValue, args) {
        return Approval.findAll();
     }
    },
    distributors: {
      type: new GraphQLList(DistributorType),
      args: { },
      resolve(parentValue, args) {
        return Distributor.findAll();
     }
    },
    user_ts: {
      type: new GraphQLList(UserTType),
      args: { },
      resolve(parentValue, args) {
        return UserT.findAll();
     }
    },
    orders: {
      type: new GraphQLList(OrderType),
      args: { },
      resolve(parentValue, args) {
        return Order.findAll();
     }
    },
    payments: {
      type: new GraphQLList(PaymentType),
      args: { },
      resolve(parentValue, args) {
        return Payment.findAll();
     }
    },
    price_historys: {
      type: new GraphQLList(PriceHistoryType),
      args: { },
      resolve(parentValue, args) {
        return PriceHistory.findAll();
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
