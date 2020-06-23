var express = require('express');
var app = express();

//setting middleware
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('categoryicon'));
app.use(express.static('productimage'));

var server = app.listen(5000);