'use strict';

// All external libraries
var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

// Create the express application
var app = express();

// Use handlebars
app.set("view engine", "hbs");

// Use body parser
app.use(bodyParser.urlencoded({
    extended: false
}));

// The DB stuff
var DB;

var mongoClient = new mongodb.MongoClient('mongodb://localhost:27017/blog', {
    useNewUrlParser: true
});
mongoClient.connect(function (err) {
    if (err) {
        console.log("Error connecting to MongoDB");
    } else {
        console.log("Connection to MongoDB database blog established");
    }
    DB = mongoClient.db("blog");
});

// // List all the blog posts
app.get("/", function (request, response) {
    DB.collection("posts").find({}).toArray(function (error, allPosts) {
        if (error) {
            response.send("Error fetching blog posts");
        } else {
            var data = {
                allPosts: allPosts
            };
            response.render("index.hbs", data);
        }
    });
});


// Show add post form
app.get("/add", function (request, response) {
    var data = {};

    if (request.query.success) {
        data.postAdded = true;
    }

    response.render("add.hbs", data);
});


// Create a new post
app.post("/add", function (request, response) {
    var data = {
        title: request.body.title,
        content: request.body.content
    };

    // Insert the data in the DB.
    DB.collection("posts").insertOne(data, function (error, result) {

        if (error) {
            response.send("Error creating your blog post");
            return;
        } else {
            response.redirect("/add?success=true");
        }

    });

});


// Show edit form
app.get("/edit/:mongoId", function (request, response) {

    var mongoId = request.params.mongoId;

    var editSuccess = request.query.success;

    DB.collection("posts").findOne({
        _id: mongodb.ObjectID(mongoId)
    }, function (error, data) {
        if (error) {
            response.send("Error: Not found");
            return;
        }

        if (editSuccess) {
            data.success = true;
        }

        response.render("edit.hbs", data);

    });

});


// Update a blog post
app.post("/edit/:mongoId", function (request, response) {

    var mongoId = request.params.mongoId;

    var newTitle = request.body.title;
    var newContent = request.body.content;

    DB.collection("posts").updateOne({
            _id: mongodb.ObjectID(mongoId)
        }, // Filter an unique object
        {
            $set: {
                title: newTitle,
                content: newContent
            }
        }, // The new data to update
        function (error, data) { // The callback after update is done

            response.redirect("/edit/" + mongoId + "?success=true");

        });

});

// Show sign up page
app.get("/signup", function (request, response) {
    response.render("signup.hbs");
});


// Create a new user
app.post("/signup", function (request, response) {
    var userData = {
        name: request.body.name,
        email: request.body.email,
        password: request.body.password
    };

    // Insert sign up data in the users collection
    DB.collection("users").insertOne(userData, function (error, result) {

        if (error) {
            response.send("Error creating your user account");
            return;
        } else {
            response.redirect("/signup?success=true");
        }
    });
});

// Show login page
app.get("/login", function (request, response) {
    response.render("login.hbs");
});

// validate user details
app.post('/login', function (request, response) {

    DB.collection('users').findOne({
        email: request.body.email
    }, function (err, user) {
        if (user === null) {
            response.send("Login invalidddd");
        } else if (user.email === request.body.email && user.password === request.body.password) {
            response.send("Login successfull!");
        } else {
            response.send("Login invalid");
        }
    });

});


app.listen(3000);