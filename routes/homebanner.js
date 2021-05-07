const express = require('express');
const app = express();
var connection = require('../config/db');
var slug = require('slug')
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'public/uploads/homebannerimage/');
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
} }).single('homebannerimage');
//var upload = multer({ dest: 'public/uploads/homebannerimage/' })

  app.post('/homebanner', (req, res) => {
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
        
        const imagepath = 'public/uploads/homebannerimage/'+req.file.filename;
        sizeOf(imagepath, function (err, dimensions) {
          //console.log(dimensions.width, dimensions.height);
          if(dimensions.width==640 && dimensions.height==310)
            {
                var callbackCounter = 0;
                // here in the req.file you will have the uploaded avatar file
                var params  = JSON.parse(req.body.data);

                //console.log(req);
                connection.query('select sortorder from tbl_homebanner order by sortorder desc limit 1', function (error, results2, fields) {
                  if (error) throw error;
                  var sortorder=0;
                  if(results2.length)
                  {
                    var sortstring=JSON.stringify(results2);
                    var sortjson =  JSON.parse(sortstring);
                    sortorder = sortjson[0].sortorder+1;
                  }

                  params.created_date= new Date();
                  params.homebannerimage= req.file.filename;
                  params.sortorder=sortorder;

                  if (params.isactive == true)
                  {
                    params.isactive = 1;
                  }
                  else
                  {
                    params.isactive = 0;
                  }
                  
                  connection.query('INSERT INTO `tbl_homebanner` SET `isactive`=?,`created_date`=?,`homebannerimage`=?,`sortorder`=?', 
                    [params.isactive, params.created_date, params.homebannerimage,
                    params.sortorder], function (error, Insertresults, fields) {
                    if (error) throw error;
                    if(Insertresults.insertId > 0)
                      {
                        res.send({Message:"success"});
                      }
                  });
                });
            }
            else
            {
              fs.unlink(imagepath, (err) => {
              });
              return res.send({ Message: 'Image size must be 640px X 310px.'})
            }
        });
      }
    });
  });

  //rest api to get all homebanner
  app.get('/homebanner', function (req, res) {
    connection.query('select * from tbl_homebanner', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });


  //rest api to get a single tbl_homebanner data
  app.get('/homebannerdetail/:id', function (req, res) {
    var callbackCounter = 0;
    connection.query('select * from tbl_homebanner where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       let homebanners = [];
       results.forEach(element => { 
          homebanners.push(element);
          callbackCounter++;
          if(results.length == callbackCounter)
          {
            res.send(homebanners);
          }
      });
     });
  });
  
  //rest api to update record into mysql database
  app.post('/updatehomebanner', (req, res) => {

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

        const imagepath = 'public/uploads/homebannerimage/'+req.file.filename;
        sizeOf(imagepath, function (err, dimensions) {
          //console.log(dimensions.width, dimensions.height);
          if(dimensions.width==640 && dimensions.height==310)
            {
              var callbackCounter = 0;
              // here in the req.file you will have the uploaded avatar file
              var params  = JSON.parse(req.body.data);
              //console.log(req);

              if (params.isactive == true)
              {
                params.isactive = 1;
              }
              else
              {
                params.isactive = 0;
              }
              
              connection.query('select homebannerimage,sortorder from tbl_homebanner where id='+params.id, function (error, results, fields) {
                if (error) throw error;
                if(results.length)
                {
                  var newstring=JSON.stringify(results);
                  var newjson =  JSON.parse(newstring);
                  oldhomebannerimage = newjson[0].homebannerimage;
                  oldsortorder = newjson[0].sortorder;

                  const unlinkimagepath = 'public/uploads/homebannerimage/'+oldhomebannerimage;
                  fs.unlink(unlinkimagepath, (err) => {});

                  if(oldsortorder!=params.sortorder)
                  {
                    connection.query('update tbl_homebanner set sortorder=sortorder+1 where id !='+params.id+' and sortorder >= '+params.sortorder, function (error, results, fields) {
                      if (error) throw error;
                    });
                  }
                  
                  params.homebannerimage= req.file.filename;

                  connection.query('UPDATE `tbl_homebanner` SET `sortorder`=?,`isactive`=?,`homebannerimage`=? where `id`=?', [params.sortorder, params.isactive, params.homebannerimage, params.id], function (error, results, fields) {
                    if (error) throw error;
                    res.send({Message:"success"});
                  });
                }
              });
            }
            else
            {
              fs.unlink(imagepath, (err) => {
              });
              return res.send({ Message: 'Image size must be 640px X 310px.'})
            }
        });
      }
    });
  });

  //rest api to update record into mysql database
  app.post('/updatedata', function (req, res) {
    // here in the req.file you will have the uploaded avatar file
    var callbackCounter = 0;
    var params  = req.body;
    //console.log(req);
    
    if (params.isactive == true)
    {
      params.isactive = 1;
    }
    else
    {
      params.isactive = 0;
    }

    connection.query('select sortorder from tbl_homebanner where id='+params.id, function (error, results, fields) {
      if (error) throw error;
      if(results.length)
      {
        var newstring=JSON.stringify(results);
        var newjson =  JSON.parse(newstring);
        oldsortorder = newjson[0].sortorder;

        if(oldsortorder!=params.sortorder)
        {
          connection.query('update tbl_homebanner set sortorder=sortorder+1 where id !='+params.id+' and sortorder >= '+params.sortorder, function (error, results, fields) {
            if (error) throw error;
          });
        }
        
        connection.query('UPDATE `tbl_homebanner` SET `sortorder`=?,`isactive`=? where `id`=?', [params.sortorder, params.isactive, params.id], function (error, results, fields) {
          if (error) throw error;
          res.send({Message:"success"});
        });
      }
    });
  });
  
  //rest api to delete record from mysql database
  app.post('/deletedata', function (req, res) {

    connection.query('select homebannerimage from tbl_homebanner where id='+req.body.id, function (error, results, fields) {
      if (error) throw error;
      if(results.length)
      {
        var newstring=JSON.stringify(results);
        var newjson =  JSON.parse(newstring);
        oldhomebannerimage = newjson[0].homebannerimage;

        const unlinkimagepath = 'public/uploads/homebannerimage/'+oldhomebannerimage;
       // console.log(unlinkimagepath);
        fs.unlink(unlinkimagepath, (err) => {});
      }

      connection.query('DELETE FROM `tbl_homebanner` WHERE id='+req.body.id, function (error, results, fields) {
          if (error) throw error;
            res.json({ Message:"success"});
      });
    });
    
  });

  //rest api to get count of homebanner into mysql database
  app.get('/GetHomebannersCount', function (req, res) {
    connection.query('select count(id) as homebannerCount from tbl_homebanner', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });
  
  module.exports = app;