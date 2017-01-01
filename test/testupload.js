var index = require("./index");

var context = (function() {});

context.done = function(response) {
    console.log(response);
};

index.handler(null, context);
