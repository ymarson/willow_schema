'use strict';

const { conn, Sequelize } = require('./db/connection');
const faker = require("faker");
const dbSync = process.env.DB_SYNC || 'false';

//start relations

//end relations

//start associations

//end associations

if ( dbSync == 'true' ){
  conn.sync({ force: true }).then(()=> {
   [1,2,3].forEach(_ => {
      //Product.create({ name: faker.name.lastName() });
   })
  });
}

//start exports

//end exports
