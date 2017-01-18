var config = {};

// Run with a local version of DynamoDB
config.runDBLocal = process.env.RUN_DB_LOCAL;
config.CLIENT_ID = process.env.CLIENT_ID;
config.CLIENT_TOKEN = process.env.CLIENT_TOKEN;
config.FBCallback = process.env.FB_CALLBACK || "http://localhost:3000";

module.exports = config;
