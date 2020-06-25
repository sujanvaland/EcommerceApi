const express = require('express');
const app = express();
var connection = require('../config/db');

  //rest api to get all deliverystaffs
  app.get('/deliverystaff', function (req, res) {
    connection.query('select * from tbl_registration', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  app.get('/GetAllDeliverystaffs', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where role_id=2', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter deliverystaff
  app.get('/GetAllDeliverystaffs/:name', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where role_id=2 and (firstname like "%'+req.params.name+'%" or lastname like "%'+req.params.name+'%")', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a login deliverystaff data
  app.post('/GetDeliverystaffInfo', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where userguid="'+req.body.CustomerGuid+'" and role_id=2', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  

  //rest api to get a login deliverystaff data
  app.get('/GetLoginDeliverystaffInfo', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where userguid=?', [req.headers.customerguid], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single tbl_registration data
  app.get('/deliverystaff/:id', function (req, res) {
    connection.query('select * from tbl_registration where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/UpdateDeliverystaffInfo', function (req, res) {
    connection.query('UPDATE `tbl_registration` SET `firstname`=?,`lastname`=?,`email`=?,`phone`=? where `userguid`=?', [req.body.FirstName,req.body.LastName, req.body.Email, req.body.Phone, req.headers.customerguid], function (error, results, fields) {
     if (error) throw error;
       res.send({Message:"success",results});
     });
  });
  
  //rest api to delete record from mysql database
  app.delete('/deliverystaff', function (req, res) {
    connection.query('DELETE FROM `tbl_registration` WHERE `id`=?', [req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send('Record has been deleted!');
     });
  });

  //rest api to get a login deliverystaff data
  app.post('/ChangePassword', function (req, res) {
    var params  = req.body;
    connection.query('select password from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if (error) throw error;
      if(results.length)
       {
          connection.query('select id from tbl_registration where userguid="'+req.headers.customerguid+'" and password="'+oldhash+'"', function (error, results, fields) {
            if (error) throw error;
            if(results.length)
              {
                connection.query('update tbl_registration set password="'+params.NewPassword+'" where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
                  if (error) throw error;
                  res.json({ Message:"success"});
                });
              }
              else
              {
                res.json({ Message:"Old password is wrong!."});
              }
          });
       }
    });
  });

  //rest api to update record into mysql database
  app.post('/lock_unlock_deliverystaff', function (req, res) {
    // here in the req.file you will have the uploaded avatar file
    var params  = req.body;
    
    if (params.isactive == true)
    {
      params.isactive = 1;
    }
    else
    {
      params.isactive = 0;
    }

    connection.query('UPDATE `tbl_registration` SET `isactive`=? where `userguid`=?', [params.isactive, params.userguid], function (error, results, fields) {
      if (error) throw error;
        res.json({ Message:"success",results});
      });
  });
  
  module.exports = app;