const express = require("express")
const app = express()
const request = require("request")
const async = require("async")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")
const Comment = require("./models/comment.js")
const middleWares = require("./middleware/middlewares.js")


//app config
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

//Database
mongoose.connect("mongodb://localhost:27017/GoodGames", { useNewUrlParser: true })

// passport configx 
app.use(require("express-session")({
    secret: "ea5e0d6bec83ab66f6571c616609a2703f54952f1e1f79045176a431cb9a045c",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

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
    Comment.find({ gameId: req.params.id }, function (err, gameComments) {
        if (gameComments.length > 0) {
            console.log(gameComments)
            if (err) {
                res.redirect("back")
            } else {
                res.locals.comments = gameComments
            }
        }
        else {
            res.locals.comments = false
        }
    })
    //Change this function to only return the array
    multipleRequests(req.params.id, req, res, "show.ejs")
})

function multipleRequests(game, req, res, template) {
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
            return res.render(template, { gameSearchResults: gameSearchResults })
        })
}

//Handling register and loogin
app.get("/register", function (req, res) {
    res.render("register.ejs")
})
app.post("/register", function (req, res) {
    var today = new Date();
    var currentDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var newUser = new User({ username: req.body.username, registerDate: currentDate })
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            //Implement error message
            res.redirect("register.ejs")
        }
        //This login the user
        passport.authenticate("local")(req, res, function () {
            //Implement success message
            res.redirect("/")
        })
    })

})
app.get("/login", function (req, res) {
    res.render("login.ejs")
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), (req, res) => {
})
app.get("/logout", function (req, res) {
    // 	This method will logout the user
    req.logout()
    res.redirect("/")
})
// Comment Routes

app.get("/game/:id/comments/new", middleWares.isLoggedIn, function (req, res) {
    res.render("./comments/new.ejs", { gameId: req.params.id })
})
app.post("/game/:id/comments", middleWares.isLoggedIn, function (req, res) {
    var newComment = {}
    newComment.text = req.body.text
    newComment.gameId = req.params.id
    console.log(newComment)
    var today = new Date();
    var currentDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    newComment.created = currentDate
    console.log(newComment)
    newComment.author = {}
    newComment.author.id = req.user._id;
    newComment.author.username = req.user.username
    Comment.create(newComment, function (err, commentCreated) {
        if (err) {
            console.log(err)
            res.redirect("back")
        } else {
            res.redirect("/game/" + req.params.id)
        }
    })
})


app.listen(3000, function () {
    console.log("Server is on")
})

