"use strict";
const graphql = require("graphql");
const cors = require('cors')
const express = require("express");
const expressGraphQl = require("express-graphql");
const { GraphQLSchema } = graphql;
const { query } = require("./schemas/queries");
const { mutation } = require("./schemas/mutations");

const schema = new GraphQLSchema({
  query,
  mutation
});

var app = express();

app.use(cors());
app.use(
  '/',
  expressGraphQl({
    schema: schema,
    graphiql: true
  })
);

app.listen(3100, () =>
  console.log('GraphQL server running on localhost:3100')
);
