var express = require('express');
var router = express.Router();
var storage = require("../storage");

// Save the vote
router.post('*', function(req, res, next) {
    // OK, let's leave comments for this song
    storage.AddCommentFromUser(req.body.date, req.body.id, req.body.comment, (err) => {
        // Redirect them to the results page (and their comments should now show)
        res.redirect("/getresults?id=" + req.body.id);
    });
});

module.exports = router;
