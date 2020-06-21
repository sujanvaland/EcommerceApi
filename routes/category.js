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
      cb(null, 'public/uploads/categoryicon/');
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
} }).single('categoryimage');
//var upload = multer({ dest: 'public/uploads/categoryicon/' })

  app.post('/category', (req, res) => {
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
        
        const imagepath = 'public/uploads/categoryicon/'+req.file.filename;
        sizeOf(imagepath, function (err, dimensions) {
          //console.log(dimensions.width, dimensions.height);
          if(dimensions.width==100 && dimensions.height==100)
            {
                // here in the req.file you will have the uploaded avatar file
                var params  = JSON.parse(req.body.data);
                
                connection.query('select name from tbl_categorymaster where name="'+params.name+'" and cat="'+params.cat+'"', function (error, results, fields) {
                  if(results.length == 0)
                  {
                      //console.log(req);
                      var parentcat = params.cat;
                      var leftextent = 0; 
                      connection.query('select leftextent from tbl_categorymaster where id='+parentcat, function (error, results1, fields) {
                          if (error) throw error;
                          if(results1.length)
                          {
                            var newstring=JSON.stringify(results1);
                            var newjson =  JSON.parse(newstring);
                            leftextent = newjson[0].leftextent;
                          }
                          
                          //console.log(leftextent);

                          connection.query('update tbl_categorymaster set leftextent=leftextent+2 where leftextent > '+leftextent, function (error, results, fields) {});
                          connection.query('update tbl_categorymaster set rightextent=rightextent+2 where rightextent > '+leftextent, function (error, results, fields) {});
                          connection.query('select sortorder from tbl_categorymaster order by sortorder desc limit 1', function (error, results2, fields) {
                            if (error) throw error;
                            var sortorder=0;
                            if(results2.length)
                            {
                              var sortstring=JSON.stringify(results2);
                              var sortjson =  JSON.parse(sortstring);
                              sortorder = sortjson[0].sortorder+1;
                            }

                            params.leftextent=(leftextent+1);
                            params.rightextent=(leftextent+2);
                            params.slug=slug(params.name);
                            params.date= new Date();
                            params.categoryimage= req.file.filename;
                            params.sortorder=sortorder;

                            if (params.isactive == true)
                            {
                              params.isactive = 1;
                            }
                            else
                            {
                              params.isactive = 0;
                            }
                            
                            connection.query('INSERT INTO `tbl_categorymaster` SET ?', params, function (error, Insertresults, fields) {
                              if (error) throw error;
                              if(Insertresults.insertId > 0)
                                {
                                  var catid=Insertresults.insertId;
                                  if(parentcat!=0)
                                  {
                                    connection.query('select category from tbl_product where category=?', [parentcat], function (error, results, fields) {
                                      if(results.length)
                                      {
                                        connection.query('update tbl_product set category="'+catid+'" where category >', [parentcat], function (error, results, fields) {});
                                      }
                                    });
                                  }
                                  res.json({ Message:"success",Insertresults});
                                }
                            });
                          });
                        });
                  }
                  else
                  {
                    fs.unlink(imagepath, (err) => {
                    });
                    return res.send({ Message: 'Category name already exist. !!!'})
                  }
                });
            }
            else
            {
              fs.unlink(imagepath, (err) => {
              });
              return res.send({ Message: 'Image size must be 100px X 100px.'})
            }
        });
      }
    });
  });

  //rest api to get all category
  app.get('/category', function (req, res) {
    connection.query('select * from tbl_categorymaster', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter category
  app.get('/category/:name', function (req, res) {
    connection.query('select * from tbl_categorymaster where name like "%'+req.params.name+'%"', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single tbl_categorymaster data
  app.get('/categorydetail/:id', function (req, res) {
    connection.query('select * from tbl_categorymaster where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/updatecategory', (req, res) => {

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

        const imagepath = 'public/uploads/categoryicon/'+req.file.filename;
        sizeOf(imagepath, function (err, dimensions) {
          //console.log(dimensions.width, dimensions.height);
          if(dimensions.width==100 && dimensions.height==100)
            {
              // here in the req.file you will have the uploaded avatar file
              var params  = JSON.parse(req.body.data);
              connection.query('select name from tbl_categorymaster where name="'+params.name+'" and cat="'+params.cat+'" and id !="'+params.id+'"', function (error, results, fields) {
                if(results.length == 0)
                {
                    //console.log(req);
                    var parentcat = params.cat;

                    if (params.isactive == true)
                    {
                      params.isactive = 1;
                    }
                    else
                    {
                      params.isactive = 0;
                    }

                    connection.query('select leftextent,rightextent,cat,categoryimage,sortorder from tbl_categorymaster where id='+params.id, function (error, results, fields) {
                      if (error) throw error;
                      if(results.length)
                      {
                        var newstring=JSON.stringify(results);
                        var newjson =  JSON.parse(newstring);
                        leftextent = newjson[0].leftextent;
                        rightextent = newjson[0].leftextent;
                        parentcat = newjson[0].cat;
                        oldcategoryimage = newjson[0].categoryimage;
                        oldsortorder = newjson[0].sortorder;

                        const unlinkimagepath = 'public/uploads/categoryicon/'+oldcategoryimage;
                        fs.unlink(unlinkimagepath, (err) => {});

                        if(parentcat!=0)
                        {
                          connection.query('update tbl_categorymaster set isactive='+params.isactive+' where leftextent >= '+leftextent+' and rightextent <= '+rightextent, function (error, results, fields) {
                            if (error) throw error;
                          });
                        }

                        if(oldsortorder!=params.sortorder)
                        {
                          connection.query('update tbl_categorymaster set sortorder=sortorder+1 where id !='+params.id+' and sortorder >= '+params.sortorder, function (error, results, fields) {
                            if (error) throw error;
                          });
                        }
                        
                        params.slug=slug(params.name);
                        params.categoryimage= req.file.filename;

                        connection.query('UPDATE `tbl_categorymaster` SET `name`=?,`slug`=?,`cat`=?,`sortorder`=?,`isactive`=?,`categoryimage`=?,`level`=? where `id`=?', [params.name, params.slug, params.cat, params.sortorder, params.isactive, params.categoryimage, params.level, params.id], function (error, results, fields) {
                          if (error) throw error;
                            res.json({ Message:"success",results});
                          });
                      }
                    });
                }
                else
                {
                  fs.unlink(imagepath, (err) => {
                  });
                  return res.send({ Message: 'Category name already exist. !!!'})
                }
              });
            }
            else
            {
              fs.unlink(imagepath, (err) => {
              });
              return res.send({ Message: 'Image size must be 100px X 100px.'})
            }
        });
      }
    });
  });

  //rest api to update record into mysql database
  app.post('/updatedata', function (req, res) {
    // here in the req.file you will have the uploaded avatar file
    var params  = req.body;
    connection.query('select name from tbl_categorymaster where name="'+params.name+'" and cat="'+params.cat+'" and id !="'+params.id+'"', function (error, results, fields) {
      if(results.length == 0)
      {
          //console.log(req);
          var parentcat = params.cat;

          if (params.isactive == true)
          {
            params.isactive = 1;
          }
          else
          {
            params.isactive = 0;
          }

          connection.query('select leftextent,rightextent,cat,sortorder from tbl_categorymaster where id='+params.id, function (error, results, fields) {
            if (error) throw error;
            if(results.length)
            {
              var newstring=JSON.stringify(results);
              var newjson =  JSON.parse(newstring);
              leftextent = newjson[0].leftextent;
              rightextent = newjson[0].leftextent;
              parentcat = newjson[0].cat;
              oldsortorder = newjson[0].sortorder;

              if(parentcat!=0)
              {
                connection.query('update tbl_categorymaster set isactive='+params.isactive+' where leftextent >= '+leftextent+' and rightextent <= '+rightextent, function (error, results, fields) {
                  if (error) throw error;
                });
              }

              if(oldsortorder!=params.sortorder)
              {
                connection.query('update tbl_categorymaster set sortorder=sortorder+1 where id !='+params.id+' and sortorder >= '+params.sortorder, function (error, results, fields) {
                  if (error) throw error;
                });
              }

              params.slug=slug(params.name);
              connection.query('UPDATE `tbl_categorymaster` SET `name`=?,`slug`=?,`cat`=?,`sortorder`=?,`isactive`=?,`level`=? where `id`=?', [params.name, params.slug, params.cat, params.sortorder, params.isactive, params.level, params.id], function (error, results, fields) {
                if (error) throw error;
                  res.json({ Message:"success",results});
                });
            }
          });
      }
      else
      {
        return res.send({ Message: 'Category name already exist. !!!'})
      }
    });
  });
  
  //rest api to delete record from mysql database
  app.post('/deletedata', function (req, res) {

    connection.query('select categoryimage from tbl_categorymaster where id='+req.body.id, function (error, results, fields) {
      if (error) throw error;
      if(results.length)
      {
        var newstring=JSON.stringify(results);
        var newjson =  JSON.parse(newstring);
        oldcategoryimage = newjson[0].categoryimage;

        const unlinkimagepath = 'public/uploads/categoryicon/'+oldcategoryimage;
       // console.log(unlinkimagepath);
        fs.unlink(unlinkimagepath, (err) => {});
      }

      connection.query('DELETE FROM `tbl_categorymaster` WHERE id='+req.body.id, function (error, results, fields) {
        if (error) throw error;
        
  
          res.json({ Message:"success"});
          //res.send('Category has been deleted!');
       });
       
    });
    
  });
  
  module.exports = app;