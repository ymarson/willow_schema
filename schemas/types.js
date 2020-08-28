const graphql = require("graphql");
const graphqlisodate = require("graphql-iso-date");
const Sequelize = require("sequelize");
//TODO manually generate these. used to assemble the JSON
const { GraphQLFloat, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLBoolean } = graphql;
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = graphqlisodate;

//start types

const UserType = new GraphQLObjectType({
  name: 'User',
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
    user_t_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.user_t_id;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    messages: {
        type: GraphQLList(MessageType),
        resolve (c) {
          return c.getMessages();
        }
      },
    approvals: {
        type: GraphQLList(ApprovalType),
        resolve (c) {
          return c.getApprovals();
        }
      },
    organisation: {
        type: OrganisationType,
        resolve (c) {
          return c.getOrganisation();
        }
      },
    user_t: {
        type: UserTypeType,
        resolve (c) {
          return c.getUserT();
        }
      },
    };
  }
});

const OrganisationType = new GraphQLObjectType({
  name: 'Organisation',
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
    },
    address: {
      type: GraphQLString,
      resolve (c) {
        return c.address;
      }
    },
    organisation_type_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.organisation_type_id;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    reputations: {
        type: GraphQLList(ReputationType),
        resolve (c) {
          return c.getReputations();
        }
      },
    };
  }
});

const ReputationType = new GraphQLObjectType({
  name: 'Reputation',
  description: 'the description',
  fields () {
    return {
    id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
    organisation_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.organisation_id;
      }
    },
    signal_type_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.signal_type_id;
      }
    },
    signal_value: {
      type: GraphQLFloat,
      resolve (c) {
        return c.signal_value;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    };
  }
});

const PolicyType = new GraphQLObjectType({
  name: 'Policy',
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
    },
    type_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.type_id;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    organisation: {
        type: OrganisationType,
        resolve (c) {
          return c.getOrganisation();
        }
      },
    };
  }
});

const ApprovalType = new GraphQLObjectType({
  name: 'Approval',
  description: 'the description',
  fields () {
    return {
    id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
    user_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.user_id;
      }
    },
    status_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.status_id;
      }
    },
    organisation_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.organisation_id;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    organisation: {
        type: OrganisationType,
        resolve (c) {
          return c.getOrganisation();
        }
      },
    };
  }
});

const DistributorType = new GraphQLObjectType({
  name: 'Distributor',
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
    },
    };
  }
});

const UserTType = new GraphQLObjectType({
  name: 'UserT',
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
    },
    };
  }
});

const OrderType = new GraphQLObjectType({
  name: 'Order',
  description: 'the description',
  fields () {
    return {
    id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
    organsation_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.organsation_id;
      }
    },
    distibutor_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.distibutor_id;
      }
    },
    value: {
      type: GraphQLFloat,
      resolve (c) {
        return c.value;
      }
    },
    status_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.status_id;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    organisation: {
        type: OrganisationType,
        resolve (c) {
          return c.getOrganisation();
        }
      },
    distributor: {
        type: DistributorType,
        resolve (c) {
          return c.getDistributor();
        }
      },
    };
  }
});

const PaymentType = new GraphQLObjectType({
  name: 'Payment',
  description: 'the description',
  fields () {
    return {
    id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
    organisation_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.organisation_id;
      }
    },
    distributor_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.distributor_id;
      }
    },
    payment_type_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.payment_type_id;
      }
    },
    value: {
      type: GraphQLFloat,
      resolve (c) {
        return c.value;
      }
    },
    time_stamp: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.time_stamp);
      }
    },
    organisation: {
        type: OrganisationType,
        resolve (c) {
          return c.getOrganisation();
        }
      },
    distributor: {
        type: DistributorType,
        resolve (c) {
          return c.getDistributor();
        }
      },
    };
  }
});

const PriceHistoryType = new GraphQLObjectType({
  name: 'PriceHistory',
  description: 'the description',
  fields () {
    return {
    id: {
      type: GraphQLInt,
      resolve (c) {
        return c.id;
      }
    },
    distributor_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.distributor_id;
      }
    },
    value: {
      type: GraphQLFloat,
      resolve (c) {
        return c.value;
      }
    },
    time_stamp: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.time_stamp);
      }
    },
    distributor: {
        type: DistributorType,
        resolve (c) {
          return c.getDistributor();
        }
      },
    };
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
    user_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.user_id;
      }
    },
    sent_from: {
      type: GraphQLInt,
      resolve (c) {
        return c.sent_from;
      }
    },
    created_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.created_date);
      }
    },
    message_status_id: {
      type: GraphQLInt,
      resolve (c) {
        return c.message_status_id;
      }
    },
    message_sent_date: {
      type: GraphQLDateTime,
      resolve (c) {
        return new Date(c.message_sent_date);
      }
    },
    };
  }
});


//end types

//start exports

exports.ApprovalType = ApprovalType;
exports.DistributorType = DistributorType;
exports.MessageType = MessageType;
exports.OrderType = OrderType;
exports.OrganisationType = OrganisationType;
exports.PaymentType = PaymentType;
exports.PolicyType = PolicyType;
exports.PriceHistoryType = PriceHistoryType;
exports.ReputationType = ReputationType;
exports.UserType = UserType;
exports.UserTType = UserTType;

//end exports

