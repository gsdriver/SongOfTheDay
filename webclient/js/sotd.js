// Makes a call to get SOTD
$(document).ready(function() {
    $.ajax({
        url: config.serviceEndpoint + "?action=getsong"
    }).then(function(song) {
        console.log(JSON.stringify(song));
        $('.sotd-song').append(song.date + " is " + song.title + " by " + song.artist);
        $('.sotd-comments').append(song.comments);
        $('.sotd-weblink').attr("href", song.weblink);
    }).fail(function(err) {
        console.log("Error: " + err);
    });
});
