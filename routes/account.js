const express = require('express');
const app = express();
var connection = require('../config/db');

  
  //rest api to get a login customer data
  app.post('/userdetail', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where username="'+req.body.username+'" and role_id=3', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
  });

  //rest api to get a customer Profile Image data
  app.get('/profileimage', function (req, res) {
    connection.query('select id,customerimage from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
  });

  //rest api to get a customer address data
  app.get('/Getcustomeraddress', function (req, res) {
    connection.query('select id,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault from tbl_manage_address where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
  });

  //rest api to add a customer address data
  app.post('/addcustomeraddress', function (req, res) {

    connection.query('select id from tbl_manage_address where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if(results.length == 0)
      {
        var params  = req.body;
        params.userguid=req.headers.customerguid;
        params.isdefault=1
        connection.query('INSERT INTO `tbl_manage_address` SET ?', params, function (error, Insertresults, fields) {
          if (error) throw error;
          res.json({ Message:"success",Insertresults});
        });
      }
      else
      {
        var params  = req.body;
        connection.query('select id from tbl_manage_address where door_no_build_no_street="'+params.door_no_build_no_street+'" and locality="'+params.locality+'" and bcity="'+params.bcity+'" and bzipcode="'+params.bzipcode+'" and userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
          if(results.length == 0)
          {
            params.userguid=req.headers.customerguid;
            params.isdefault=0
            connection.query('INSERT INTO `tbl_manage_address` SET ?', params, function (error, Insertresults, fields) {
              if (error) throw error;
              res.json({ Message:"success",Insertresults});
            });
          }
          else
          {
            res.json({ Message:"Duplicate Address",results});
          }
        });
      }
    });
  });

  //rest api to update a customer address data
  app.post('/updatecustomeraddress', function (req, res) {
    var params  = req.body;
    connection.query('select id from tbl_manage_address where door_no_build_no_street="'+params.door_no_build_no_street+'" and locality="'+params.locality+'" and bcity="'+params.bcity+'" and bzipcode="'+params.bzipcode+'" and userguid="'+req.headers.customerguid+'" and id !="'+params.id+'"', function (error, results, fields) {
      if(results.length == 0)
      {
        params.userguid=req.headers.customerguid;
        connection.query('UPDATE `tbl_manage_address` SET `bfirstname`=?,`blastname`=?,`bphone`=?,`door_no_build_no_street`=?,`locality`=?,`landmark`=?,`bcity`=?,`bzipcode`=? where `id`=? and `userguid`=?', [params.bfirstname, params.blastname, params.bphone, params.door_no_build_no_street, params.locality, params.landmark, params.bcity, params.bzipcode, params.id, req.headers.customerguid], function (error, results, fields) {
          if (error) throw error;
            res.json({ Message:"success",results});
          });
      }
      else
      {
        res.json({ Message:"Duplicate Address",results});
      }
    });
  });

  //rest api to get a customer address by id data
  app.post('/addressdetail', function (req, res) {
    var params  = req.body;
    connection.query('select id,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+params.id+'"', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
  });

  //rest api to set default address by id data
  app.post('/setasdefault', function (req, res) {
    var params  = req.body;
    connection.query('select id from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+params.id+'"', function (error, results, fields) {
      if (error) throw error;
      if(results.length > 0)
      {
        connection.query('update tbl_manage_address set isdefault=0 where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
          if (error) throw error;
          connection.query('update tbl_manage_address set isdefault=1 where userguid="'+req.headers.customerguid+'" and id="'+params.id+'"', function (error, results, fields) {
            if (error) throw error;
            res.json({ Message:"success",results});
          });
        });
      }
      else
      {
        res.json({ Message:"error",results});
      }
      
    });
  });

  //rest api to delete address by id data
  app.post('/deleteaddress', function (req, res) {
    var params  = req.body;
    connection.query('select id from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+params.id+'"', function (error, results, fields) {
      if (error) throw error;
      if(results.length > 0)
      {
        connection.query('DELETE FROM tbl_manage_address WHERE userguid="'+req.headers.customerguid+'" and id = "'+params.id+'" and isdefault != 1', function (error, results, fields) {
          if (error) throw error;
          if(results.length > 0)
          {
              res.json({ Message:"success",results});
          }
          else
          {
            res.json({ Message:"Can not delete default address.",results});
          }
        });
      }
      else
      {
        res.json({ Message:"error",results});
      }
      
    });
  });
  
  module.exports = app;