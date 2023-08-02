/*
| Author : Mohammad Ali Ghazi
| Email  : mohamadalghazy@gmail.com
| Date   : Wed Jun 01 2022
| Time   : 11:26:54 AM
 */

const config = require("config");
const serverConfig = config.get("server");

var app = require("./lib/app");

console.log(`*** SERVER Info: ENVIRONMENT: ${process.env.NODE_ENV}`);
console.log(`*** SERVER Info: Please wait; Starting...`);

const server = app.listen(serverConfig.port, async () => {

	console.log(`*** SERVER Info: Server is running on port ${serverConfig.port}...`);

});
