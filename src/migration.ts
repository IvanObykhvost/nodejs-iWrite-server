var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017";
const option = { 
    useNewUrlParser: true 
}

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection("users", function(err: any, res: any) {
        if (err) throw err;
        console.log("Collection users created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");
    dbo.collection('users').updateMany({},{ $set: {"postCount": 0}},function(err: any, res: any){
        if (err) throw err;
        console.log(res.result.nModified + " document(s) updated");
        db.close();
    });
});

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('posts', function(err: any, res: any) {
        if (err) throw err;
        console.log("Collection posts created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('comments', function(err: any, res: any) {
        if (err) throw err;
        console.log("Collection comments created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('tags', function(err: any, res: any) {
        if (err) throw err;
        console.log("Collection tags created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('stories', function(err: any, res: any) {
        if (err) throw err;
        console.log("Collection stories created!");
        db.close();
    });
});

MongoClient.connect(url, option, function(err: any, db: any) {
    if (err) throw err;
    var dbo = db.db("node");

    dbo.createCollection('categories', function(err: any, res: any) {
        if (err) throw err;
        console.log("Collection categories created!");
        db.close();
    });
});
