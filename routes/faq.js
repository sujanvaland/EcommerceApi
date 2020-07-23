const express = require('express');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');
  
  app.get('/GetAllFaqs', function (req, res) {
    connection.query('select * from tbl_faqs', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter faq
  app.get('/GetAllFaqs/:name', function (req, res) {
    connection.query('select * from tbl_faqs where question like "%'+req.params.name+'%"', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a login faq data
  app.post('/GetFaqInfo', function (req, res) {
    connection.query('select * from tbl_faqs where id="'+req.body.Id+'"', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/UpdateFaqInfo', function (req, res) {
    var params  = req.body;
    
    if (params.isactive == true)
    {
      params.isactive = 1;
    }
    else
    {
      params.isactive = 0;
    }

    connection.query('select question from tbl_faqs where question="'+params.question+'" and id!="'+params.id+'"', function (error, results, fields) {
      if(results.length == 0)
      {
        connection.query('UPDATE `tbl_faqs` SET `question`=?,`answer`=?,`isactive`=? where `id`=?', [params.question, params.answer, params.isactive, params.id], function (error, results, fields) {
          if (error) throw error;
            res.send({Message:"success",results});
          });
      }
      else
      {
        return res.send({ Message: 'Question already exist. !!!'})
      }
    });
  });

  app.post('/faq', function (req, res) {
    // here in the req.file you will have the uploaded avatar file
    var params  = req.body;
    
    connection.query('select question from tbl_faqs where question="'+params.question+'"', function (error, results, fields) {
      if(results.length == 0)
      {
          if (params.isactive == true)
          {
            params.isactive = 1;
          }
          else
          {
            params.isactive = 0;
          }
                
          connection.query('INSERT INTO `tbl_faqs` SET ?', params, function (error, Insertresults, fields) {
            if (error) throw error;
            res.json({ Message:"success",Insertresults});
          });
      }
      else
      {
        return res.send({ Message: 'Question already exist. !!!'})
      }
    });
  });

  //rest api to delete record from mysql database
  app.post('/deletedata', function (req, res) {
      connection.query('DELETE FROM `tbl_faqs` WHERE id='+req.body.id, function (error, results, fields) {
        if (error) throw error;
          res.json({ Message:"success"});
       });
  });
  
  module.exports = app;