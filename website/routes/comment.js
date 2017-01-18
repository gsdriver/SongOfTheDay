var express = require('express');
var router = express.Router();
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // OK, let's leave comments for this song
    storage.AddCommentFromUser(req.body.date, req.body.id, req.body.comment, (err) => {
        res.status(err ? 500 : 200);
        res.send("Comment received");
    });
});

module.exports = router;
