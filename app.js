'use strict';

var jade = require('jade');
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.engine('.jade', jade.__express);
app.set('views', 'web/views');
app.use(app.router);
app.use(express.static(__dirname + '/web/statics'));
app.use(express.favicon(__dirname + '/web/statics/favicon.ico'));
app.listen(port);

app.get('/', function (req, res) {
    res.render('index.jade');
});

console.log('express listening on port %s', port);
