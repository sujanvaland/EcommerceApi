const express = require('express');
const app = express();
var connection = require('../config/db');
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'public/uploads/customerimage/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg|JPG|PNG|JPEG)$/)) {
      var err = new Error();
      err.code = 'filetype';
      return cb(err);
    } 
    else 
    {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    } 
  }
});

var upload = multer({ storage: storage,limits: {
  fileSize: 1000000
} }).single('customerimage');
//var upload = multer({ dest: 'public/uploads/customerimage/' })

  //rest api to get a customer Account Detail data
  app.get('/accountdetail', function (req, res) {
    connection.query('select id,firstname,lastname,birthdate,gender,email,phone,userguid,username,role_id,isactive,customerimage from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
  });

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
    connection.query('select id,addresstype,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault from tbl_manage_address where userguid="'+req.headers.customerguid+'" order by id asc', function (error, results, fields) {
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
        connection.query('UPDATE `tbl_manage_address` SET `addresstype`=?,`bfirstname`=?,`blastname`=?,`bphone`=?,`door_no_build_no_street`=?,`locality`=?,`landmark`=?,`bcity`=?,`bzipcode`=? where `id`=? and `userguid`=?', [params.addresstype, params.bfirstname, params.blastname, params.bphone, params.door_no_build_no_street, params.locality, params.landmark, params.bcity, params.bzipcode, params.id, req.headers.customerguid], function (error, results, fields) {
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
    if(params.id > 0)
    {
      var sql = 'select id,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+params.id+'"';
    }
    else
    {
      var sql = 'select id,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault from tbl_manage_address where userguid="'+req.headers.customerguid+'" and isdefault=1';
    }
    connection.query(sql, function (error, results, fields) {
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
    connection.query('select id from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+params.id+'" and isdefault != 1', function (error, results, fields) {
      if (error) throw error;
      if(results.length > 0)
      {
        connection.query('DELETE FROM tbl_manage_address WHERE userguid="'+req.headers.customerguid+'" and id = "'+params.id+'" and isdefault != 1', function (error, results, fields) {
          if (error) throw error;
          res.json({ Message:"success",results});
        });
      }
      else
      {
        res.json({ Message:"Can not delete default address.",results});
      }
      
    });
  });

  //rest api to update Profile Image record into mysql database
  app.post('/updateprofileimage', (req, res) => {

    upload(req, res, function (err) {
      if (err) 
      {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.send({ Message: 'limit file size 1MB'})
        } else if (err.code === 'filetype') {
            return res.send({ Message: 'Must be valid file extension only jpg or png'})
        } else {
            return res.send({ Message: 'something went wrong'})
        }

      } 
      else 
      {
        if (!req.file) {
            return res.send({ Message: 'No file selected'})
        } 

        const imagepath = 'public/uploads/customerimage/'+req.file.filename;
        // here in the req.file you will have the uploaded avatar file
        var params  = req.body;
              
        connection.query('select customerimage from tbl_registration where userguid="'+params.userguid+'"', function (error, results, fields) {
          if (error) throw error;
          if(results.length)
          {
            var newstring=JSON.stringify(results);
            var newjson =  JSON.parse(newstring);
            oldcustomerimage = newjson[0].customerimage;
            if(oldcustomerimage!='')
            {
              const unlinkimagepath = 'public/uploads/customerimage/'+oldcustomerimage;
              fs.unlink(unlinkimagepath, (err) => {});
            }
            params.customerimage= req.file.filename;
            connection.query('UPDATE `tbl_registration` SET `customerimage`=? where `userguid`=?', [params.customerimage, params.userguid], function (error, results, fields) {
              if (error) throw error;
                res.json({ Message:"success",customerimage:params.customerimage,results});
              });
          }
        });
      }
    });
  });

  //rest api to update a personal detail data
  app.post('/updatepersonaldetail', function (req, res) {
    var params  = req.body;
    connection.query('select id from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if(results.length > 0)
      {
        var birthdate=params.birthdate;
        var strSplitDate = String(birthdate).split('T');
        var dateArray = strSplitDate[0].split('-');
        let convertbirthdate =  dateArray[0]+"-"+dateArray[1]+"-"+dateArray[2];
        connection.query('UPDATE `tbl_registration` SET `firstname`=?,`lastname`=?,`birthdate`=?,`gender`=?,`email`=?,`phone`=? where `userguid`=?', [params.firstname, params.lastname, convertbirthdate, params.gender, params.email, params.phone, req.headers.customerguid], function (error, results, fields) {
          if (error) throw error;
            res.json({ Message:"success"});
          });
      }
      else
      {
        res.json({ Message:"User Not Found."});
      }
    });
  });

  //rest api to update a Change Password data
  app.post('/ChangePassword', function (req, res) {
    var params  = req.body;
    connection.query('select id from tbl_registration where password="'+params.oldpassword+'" and userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if(results.length > 0)
      {
        connection.query('UPDATE `tbl_registration` SET `password`=? where `userguid`=?', [params.newpassword, req.headers.customerguid], function (error, results, fields) {
          if (error) throw error;
            res.json({ Message:"success"});
          });
      }
      else
      {
        res.json({ Message:"Current Password is not match."});
      }
    });
  });
  
  module.exports = app;