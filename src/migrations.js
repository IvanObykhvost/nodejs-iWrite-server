var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017";
const option = { 
    useNewUrlParser: true 
}

MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("Collection users created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('posts', function(err, res) {
        if (err) throw err;
        console.log("Collection posts created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('follows', function(err, res) {
        if (err) throw err;
        console.log("Collection follows created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('favorites', function(err, res) {
        if (err) throw err;
        console.log("Collection favorites created!");
        db.close();
    });
});