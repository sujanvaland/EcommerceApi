const express = require('express');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');
  
  app.get('/GetAllCms', function (req, res) {
    connection.query('select * from tbl_cms', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter cms
  app.get('/GetAllCms/:name', function (req, res) {
    connection.query('select * from tbl_cms where title like "%'+req.params.name+'%"', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a login cms data
  app.post('/GetCmsInfo', function (req, res) {
    connection.query('select * from tbl_cms where id="'+req.body.Id+'"', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/UpdateCmsInfo', function (req, res) {
    connection.query('UPDATE `tbl_cms` SET `description`=? where `id`=?', [req.body.description, req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send({Message:"success",results});
     });
  });
  
  module.exports = app;