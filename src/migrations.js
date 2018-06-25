var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("Collection users created!");
        db.close();
    });
});

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('posts', function(err, res) {
        if (err) throw err;
        console.log("Collection posts created!");
        db.close();
    });
});