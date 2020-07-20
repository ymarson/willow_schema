//🥶CORE TODO: change to npx sequelize-cli... using shell command

const execSync = require('child_process').execSync;
// code = execSync('npx sequelize-cli migration:generate --name sweetPotato');

// var fileName = execSync('ls -rt migrations/*potato.js | head -1')
var col_type = "cheeseString"
execSync('npx sequelize-cli migration:generate --name ' + col_type);
var fileName = execSync('ls -rt migrations/*'+ col_type + '.js | head -1');
fs.writeFileSync(fileName, migContent);