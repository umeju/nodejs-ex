//  OpenShift sample Node application
var express = require('express'),
        app = express(),
        morgan = require('morgan'),
        http = require('http').Server(app),
        io = require('socket.io')(http);

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
        ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
        mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
        mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
            mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
            mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
            mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
            mongoPassword = process.env[mongoServiceName + '_PASSWORD']
    mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    }
}
var db = null,
        dbDetails = new Object();

var initDb = function (callback) {
    if (mongoURL == null)
        return;

    var mongodb = require('mongodb');
    if (mongodb == null)
        return;

    mongodb.connect(mongoURL, function (err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};

app.use('/pages', express.static(__dirname + '/pages'));
app.use('/action', express.static(__dirname + '/action'));
app.use('/common', express.static(__dirname + '/common'));

app.get('/', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({ip: req.ip, date: Date.now()});
        col.count(function (err, count) {
            res.render('index.html', {pageCountMessage: count, dbInfo: dbDetails});
        });
    } else {
        res.render('index.html', {pageCountMessage: null});
    }
});

app.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        db.collection('counts').count(function (err, count) {
            res.send('{ pageCount: ' + count + '}');
        });
    } else {
        res.send('{ pageCount: -1 }');
    }
});

app.get('/chat', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({ip: req.ip, date: Date.now()});
        col.count(function (err, count) {
            res.render('chat.html', {pageCountMessage: count, dbInfo: dbDetails});
        });
    } else {
        res.render('chat.html', {pageCountMessage: null});
    }
});

app.get('/pages/:pagename', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function (err) {});
    }
    if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({ip: req.ip, date: Date.now()});
        col.count(function (err, count) {
            res.render('chat.html', {pageCountMessage: count, dbInfo: dbDetails});
        });
    } else {
        pageUrl = req.params.pagename;
        res.render('pages/'+ pageUrl +'.html', {pageCountMessage: null});
    }
});

app.get("/action/:action/:ID", function (req, res) {
    //var event = req.params.event;
    var data = {
        "pages": {
            "action": req.params.action,
            "ID": req.params.ID
        }
    };
    
    var referID = data.pages.ID;
    var referAction = data.pages.action;
    // the user was found and is available in req.user
    io.emit(
        data.pages.ID + '-' + data.pages.action,
        req.query
//          data.pages.ID + '-' + data.pages.action
    );
    
    console.log("azione");
    
//    io.emit('chat message', "emit this message");
    //  socket.volatile.emit(data.pages.ID+'-'+data.pages.action, data.pages.ID+'-'+data.pages.action);
//            req.query = {"city" : selectedCity}
    console.log('req.query:'+req.query);
    console.log('**********');
    console.log("data.pages.ID: " + data.pages.ID);
    console.log('**********');
    console.log("data.pages.action: " + data.pages.action);
    console.log('**********');
    res.send(data);
});

/*
 app.get('/chat', function(req, res){
 res.render('chat.html');
 });
 */
io.on('connection', function (socket) {
    console.log('user connected');
    
    io.emit('onconnection', socket.id);
    
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
        console.log('message emitted: ' + msg);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    
    socket.on('storeClientInfo', function (data) {
        
        var clientInfo = new Object();
        clientInfo.customId = data.customId;
        clientInfo.socketId = socket.id;
        console.log('clients push: socketId= ' + socket.id +' & ' + data.customId);
        
        io.emit('onconnection', socket.id);
    });
    
});


// error handling
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

initDb(function (err) {
    console.log('Error connecting to Mongo. Message:\n' + err);
});

//http.listen(port, ip);
http.listen(port, function () {
    console.log('Server - running on http://%s:%s', ip, port);
});
//console.log('Server running on http://%s:%s', ip, port);

// module.exports = http;
