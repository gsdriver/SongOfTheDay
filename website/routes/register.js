var express = require('express');
var router = express.Router();
var storage = require("../storage");

// Register a new user
router.post("*", function(req, res, next) {
    // Let's register
    var userData = storage.createNewUser(req.body.id, req.body.email);
    userData.save(err => {
        // Great, go back to the main page
        console.log("Registered user");
        res.redirect("/");
    });
});

module.exports = router;
