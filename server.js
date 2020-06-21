require('dotenv').config();
var http = require("http");
var express = require('express');
const cors = require('cors');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require('path');

app.use(cors());

//setting middleware
app.use(express.static('public'));

//start body-parser configuration
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//end body-parser configuration

app.get('/', (req, res) => {
  res.send("Welcome to myStore API");
});

app.use("/api", require("./routes/routes"));

// request to handle undefined or all other routes
// app.get("*", function(req, res) {
//   logger.info("wrong route");
//   res.send("You have hit the wrong URL");
// })

//create app server
var server = app.listen(3000,  "127.0.0.1", function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});



