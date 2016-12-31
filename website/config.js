var config = {};

// Run with a local version of DynamoDB
config.runDBLocal = true;
config.CLIENT_ID = process.env.CLIENT_ID;
config.CLIENT_TOKEN = process.env.CLIENT_TOKEN;
config.FBCallback = "http://localhost:3000";

module.exports = config;
