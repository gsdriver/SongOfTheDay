var app = angular.module("myApp", []);



app.controller('myCtrl', function ($scope, $http) {
    $http.get("http://localhost:3000/")
    .then(function (response) {
        $scope.myWelcome = "Using data from the server";
        $scope.songTree = response.data;
    }, function (response) {
        $scope.myWelcome = "Something went wrong";
    });

    $scope.UpdateList = function (songList) {
        if (songList.length > 0) {
            $scope.songTree.songList.push(songList[0]);
            songList.shift();
        }
    };

    $scope.SaveChanges = function () {
        $http.defaults.headers.post["Content-Type"] = "text/plain";

        $http.post("http://localhost:3000/", JSON.stringify($scope.songTree))
        .then(function (response) {
            $scope.myWelcome = "Data saved";
        }, function (response) {
            $scope.myWelcome = "Problem saving data";
        });
    };
});


/* 
 * The data structure is a tree - each node in the tree is an object with two
 * fields - songList (a list of sorted songs) and children (child nodes).
 * The parent node is considered the list that each of the child nodes will sort into
 *
 * A node with an empty list is a placeholder indicating how lists will combine
 * to complete the master list
 */

 /*
app.controller('myCtrl', function ($scope) {
    $scope.songTree = {
        songList: [{ title: "ROUND AND ROUND", artist: "RATT"}],
        children: [
            { songList: [{ title: "SHAKE ME", artist: "CINDERELLA" }, { title: "TALK DIRTY TO ME", artist: "POISON"}], children: [] },
            { songList: [{ title: "WILD AND THE YOUNG", artist: "QUIET RIOT"}], children: [] },
            { songList: [{ title: "WAIT", artist: "WHITE LION"}], children: [] },
            { songList: [{ title: "ROCK ME", artist: "GREAT WHITE"}], children: [] }
        ]
    };
    $scope.testValue = 66;
}); */


