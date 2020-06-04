var express = require("express")
var app = express()
var request = require("request")
const async = require("async")



//app config
app.use(express.static(__dirname + '/public'));

//Routes
app.get("/", function (req, res) {
    var url = "https://api.rawg.io/api/games?dates=2020-05-25,2020-10-10&ordering=-added"
    //Get the data of the upcoming games
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var gamesData = JSON.parse(body)
            res.render("games.ejs", { gamesData: gamesData })
        }
    })
})
app.get('/search', function (req, res) {
    //Make 2 requests for obtaining the games´s information and the series information
    multipleRequests(req.query.game, req, res, "search.ejs")
});

app.get("/game/:id", function (req, res) {
    multipleRequests(req.params.id, req, res, "show.ejs")
})

function multipleRequests(game, req, res, templateName) {
    async.parallel([
        //game info
        function (done) {
            var queryName = game;
            //change the spaces for hiffens
            var gameName = queryName.replace(/\s+/g, '-').toLowerCase()
            var gmSearchURL = "https://api.rawg.io/api/games/" + gameName;
            request(gmSearchURL, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    done(null, data);
                }
            });
        },
        // Game series
        function (done) {
            var queryName = game;
            var gameName = queryName.replace(/\s+/g, '-').toLowerCase()
            var gmSearchURL = "https://api.rawg.io/api/games/" + gameName + "/game-series";
            request(gmSearchURL, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // console.log(body) 
                    var data = JSON.parse(body);
                    // below shows whole object of result 0
                    done(null, data);
                }
            });
        }], function (err, gameSearchResults) {
            //Send an array with the info, in gameSearchResults[0] is the info of the game, gameSearchResults[1]-->Game Series data
            res.render(templateName, {
                gameSearchResults: gameSearchResults
            });
        })
}

app.listen(3000, function () {
    console.log("Server is on")
})

