'use strict';

const { conn, Sequelize } = require('./db/connection');
const faker = require("faker");
const dbSync = process.env.DB_SYNC || 'false';

//start relations

const Customer = conn.define('customer', {
id: {
	type: Sequelize.INTEGER, 
	autoIncrement: true, 
	primaryKey: true, 
	allowNull: false
}, 
first_name: {
	type: Sequelize.STRING, 
	allowNull: false
}, 
last_name: {
	type: Sequelize.STRING, 
	allowNull: false
}, 
tier_id: {
	type: Sequelize.INTEGER, 
	allowNull: false
}, 
created_date: {
	type: Sequelize.DATE, 
	allowNull: false
} 
 
}); 

const Message = conn.define('message', {
id: {
	type: Sequelize.INTEGER, 
	autoIncrement: true, 
	primaryKey: true, 
	allowNull: false
}, 
customer_id: {
	type: Sequelize.INTEGER, 
	allowNull: false
}, 
body: {
	type: Sequelize.STRING, 
	allowNull: false
}, 
inout: {
	type: Sequelize.INTEGER, 
	allowNull: false
}, 
message_type_id: {
	type: Sequelize.INTEGER, 
	allowNull: false
}, 
created_date: {
	type: Sequelize.DATE, 
	allowNull: false
} 
 
}); 

const Toy = conn.define('toy', {
id: {
	type: Sequelize.STRING, 
	autoIncrement: true, 
	primaryKey: true, 
	allowNull: false
}, 
name: {
	type: Sequelize.STRING, 
	allowNull: false
} 
 
}); 

const Movie = conn.define('movie', {
id: {
	type: Sequelize.INTEGER, 
	autoIncrement: true, 
	primaryKey: true, 
	allowNull: false
}, 
name: {
	type: Sequelize.STRING, 
	allowNull: false
} 
 
}); 


//end relations

//start associations

Customer.hasMany(Message, {
	as: 'messages',
	foreignKey: 'customer_id',
	sourceKey: 'id'
});
Message.belongsTo(Customer, {
	as: 'customer',
	foreignKey: 'message_id',
	sourceKey: 'id'
});

//end associations

if ( dbSync == 'true' ){
  conn.sync({ force: true }).then(()=> {
   [1,2,3].forEach(_ => {
      //Product.create({ name: faker.name.lastName() });
   })
  });
}

//start exports

exports.Customer = Customer; 
exports.Message = Message; 
exports.Toy = Toy; 
exports.Movie = Movie; 

//end exports
