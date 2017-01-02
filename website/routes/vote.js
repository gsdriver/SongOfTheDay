var express = require('express');
var router = express.Router();
var utils = require("../Utils");
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // Place the vote
    storage.SaveVote(req.body.id, req.body.date, req.body.vote, (err) => {
        if (err)
        {
            res.render("error", {error: err});
        }
        else
        {
            // Let them know the results of yesterday's song
            res.redirect("/getresults");
        }
    });
});

module.exports = router;
