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
      cb(null, 'public/uploads/productimage/');
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
} }).single('productimage');
//var upload = multer({ dest: 'public/uploads/productimage/' })

  app.post('/product', (req, res) => {
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
        
        const imagepath = 'public/uploads/productimage/'+req.file.filename;
        sizeOf(imagepath, function (err, dimensions) {
          //console.log(dimensions.width, dimensions.height);
          if(dimensions.width<=605 && dimensions.height<=380)
            {
                var callbackCounter = 0;
                // here in the req.file you will have the uploaded avatar file
                var params  = JSON.parse(req.body.data);

                connection.query('select productname from tbl_product where productname="'+params.productname+'"', function (error, results, fields) {
                  if(results.length == 0)
                  {
                    //console.log(req);
                    connection.query('select sortorder from tbl_product order by sortorder desc limit 1', function (error, results2, fields) {
                      if (error) throw error;
                      var sortorder=0;
                      if(results2.length)
                      {
                        var sortstring=JSON.stringify(results2);
                        var sortjson =  JSON.parse(sortstring);
                        sortorder = sortjson[0].sortorder+1;
                      }

                      params.slug=slug(params.productname);
                      params.created_date= new Date();
                      params.productimage= req.file.filename;
                      params.sortorder=sortorder;

                      if (params.isnewarrival == true)
                      {
                        params.isnewarrival = 1;
                      }
                      else
                      {
                        params.isnewarrival = 0;
                      }

                      if (params.isactive == true)
                      {
                        params.isactive = 1;
                      }
                      else
                      {
                        params.isactive = 0;
                      }

                      // if (params.instock == true)
                      // {
                      //   params.instock = 1;
                      // }
                      // else
                      // {
                      //   params.instock = 0;
                      // }
                      
                      connection.query('INSERT INTO `tbl_product` SET `category`=?,`productname`=?,`shortdesc`=?,`detaildesc`=?,`pieces`=?,`net_weight`=?,`price`=?,`isnewarrival`=?,`isactive`=?,`slug`=?,`created_date`=?,`productimage`=?,`sortorder`=?', 
                       [params.category, params.productname, params.shortdesc, 
                        params.detaildesc, params.pieces, params.net_weight, 
                        params.price, params.isnewarrival, params.isactive,
                        params.slug, params.created_date, params.productimage,
                        params.sortorder], function (error, Insertresults, fields) {
                        if (error) throw error;
                        if(Insertresults.insertId > 0)
                          {
                            if(params.stockin.length > 0) 
                            {
                              params.stockin.forEach(newelement => {
                                if(params.stockin.length==1 && newelement=='')
                                {
                                  res.send({Message:"success"});
                                }
                                else
                                {
                                  callbackCounter++;
                                  if(newelement!='')
                                  {
                                    connection.query('INSERT INTO `tbl_location_stock` SET `pid`=?,`location`=?,`instock`=?', [Insertresults.insertId, newelement, '1'], function (error, Insertresults, fields) {
                                      if (error) throw error;
                                      if(params.stockin.length == callbackCounter)
                                      {
                                        res.send({Message:"success"});
                                      }
                                    });
                                  }
                                }
                              });
                            }
                            else
                            {
                              res.send({Message:"success"});
                            }
                          }
                      });
                    });
                  }
                  else
                  {
                    fs.unlink(imagepath, (err) => {
                    });
                    return res.send({ Message: 'Product name already exist. !!!'})
                  }
                });
            }
            else
            {
              fs.unlink(imagepath, (err) => {
              });
              return res.send({ Message: 'Recommended image size is 605px X 380px.'})
            }
        });
      }
    });
  });

  //rest api to get all product
  app.get('/product', function (req, res) {
    connection.query('select *,(select name from tbl_categorymaster where id=tbl_product.category) as categoryname from tbl_product', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter product
  app.get('/product/:productname', function (req, res) {
    connection.query('select *,(select name from tbl_categorymaster where id=tbl_product.category) as categoryname from tbl_product where productname like "%'+req.params.productname+'%"', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single tbl_product data
  app.get('/productdetail/:id', function (req, res) {

    var callbackCounter = 0;
    connection.query('select * from tbl_product where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       let products = [];
       results.forEach(element => { 
        connection.query('select * from tbl_location_stock where pid="'+element.id+'"', function (error, instockresult, fields) {
          if (error) throw error;
          element.stockinlocation = [];
          instockresult.forEach(newelement => {
            element.stockinlocation.push(newelement.location);
          });
          products.push(element);
          callbackCounter++;
          if(results.length == callbackCounter)
          {
            res.send(products);
          }
        });
      });
     });
  });
  
  //rest api to update record into mysql database
  app.post('/updateproduct', (req, res) => {

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

        const imagepath = 'public/uploads/productimage/'+req.file.filename;
        sizeOf(imagepath, function (err, dimensions) {
          //console.log(dimensions.width, dimensions.height);
          if(dimensions.width<=605 && dimensions.height<=380)
            {
              var callbackCounter = 0;
              // here in the req.file you will have the uploaded avatar file
              var params  = JSON.parse(req.body.data);
              connection.query('select productname from tbl_product where productname="'+params.productname+'" and id !="'+params.id+'"', function (error, results, fields) {
                if(results.length == 0)
                {
                    //console.log(req);
                    
                    if (params.isnewarrival == true)
                    {
                      params.isnewarrival = 1;
                    }
                    else
                    {
                      params.isnewarrival = 0;
                    }

                    if (params.isactive == true)
                    {
                      params.isactive = 1;
                    }
                    else
                    {
                      params.isactive = 0;
                    }

                    // if (params.instock == true)
                    // {
                    //   params.instock = 1;
                    // }
                    // else
                    // {
                    //   params.instock = 0;
                    // }

                    params.instock = 1;

                    connection.query('select productimage,sortorder from tbl_product where id='+params.id, function (error, results, fields) {
                      if (error) throw error;
                      if(results.length)
                      {
                        var newstring=JSON.stringify(results);
                        var newjson =  JSON.parse(newstring);
                        oldproductimage = newjson[0].productimage;
                        oldsortorder = newjson[0].sortorder;

                        const unlinkimagepath = 'public/uploads/productimage/'+oldproductimage;
                        fs.unlink(unlinkimagepath, (err) => {});

                        if(oldsortorder!=params.sortorder)
                        {
                          connection.query('update tbl_product set sortorder=sortorder+1 where id !='+params.id+' and sortorder >= '+params.sortorder, function (error, results, fields) {
                            if (error) throw error;
                          });
                        }
                        
                        params.slug=slug(params.productname);
                        params.productimage= req.file.filename;

                        connection.query('UPDATE `tbl_product` SET `productname`=?,`slug`=?,`category`=?,`shortdesc`=?,`detaildesc`=?,`pieces`=?,`net_weight`=?,`price`=?,`sortorder`=?,`isnewarrival`=?,`instock`=?,`isactive`=?,`productimage`=? where `id`=?', [params.productname, params.slug, params.category, params.shortdesc, params.detaildesc, params.pieces, params.net_weight, params.price, params.sortorder, params.isnewarrival, params.instock, params.isactive, params.productimage, params.id], function (error, results, fields) {
                          if (error) throw error;
                          if(params.stockin.length > 0) 
                            {
                              connection.query('DELETE FROM `tbl_location_stock` WHERE pid='+params.id, function (error, results, fields) {
                                if (error) throw error;
                                params.stockin.forEach(newelement => {
                                  if(params.stockin.length==1 && newelement=='')
                                  {
                                    res.send({Message:"success"});
                                  }
                                  else
                                  {
                                    callbackCounter++;
                                    if(newelement!='')
                                    {
                                      connection.query('INSERT INTO `tbl_location_stock` SET `pid`=?,`location`=?,`instock`=?', [params.id, newelement, '1'], function (error, Insertresults, fields) {
                                        if (error) throw error;
                                        if(params.stockin.length == callbackCounter)
                                        {
                                          res.send({Message:"success"});
                                        }
                                      });
                                    }
                                  }
                                });
                               });
                            }
                          else
                            {
                              res.send({Message:"success"});
                            }
                        });
                      }
                    });
                }
                else
                {
                  fs.unlink(imagepath, (err) => {
                  });
                  return res.send({ Message: 'Product productname already exist. !!!'})
                }
              });
            }
            else
            {
              fs.unlink(imagepath, (err) => {
              });
              return res.send({ Message: 'Recommended image size is 605px X 380px.'})
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
    connection.query('select productname from tbl_product where productname="'+params.productname+'" and id !="'+params.id+'"', function (error, results, fields) {
      if(results.length == 0)
      {
          //console.log(req);
          
          if (params.isnewarrival == true)
          {
            params.isnewarrival = 1;
          }
          else
          {
            params.isnewarrival = 0;
          }

          if (params.isactive == true)
          {
            params.isactive = 1;
          }
          else
          {
            params.isactive = 0;
          }

          // if (params.instock == true)
          // {
          //   params.instock = 1;
          // }
          // else
          // {
          //   params.instock = 0;
          // }

          params.instock = 1;

          connection.query('select sortorder from tbl_product where id='+params.id, function (error, results, fields) {
            if (error) throw error;
            if(results.length)
            {
              var newstring=JSON.stringify(results);
              var newjson =  JSON.parse(newstring);
              oldsortorder = newjson[0].sortorder;

              
              if(oldsortorder!=params.sortorder)
              {
                connection.query('update tbl_product set sortorder=sortorder+1 where id !='+params.id+' and sortorder >= '+params.sortorder, function (error, results, fields) {
                  if (error) throw error;
                });
              }
              
              params.slug=slug(params.productname);

              connection.query('UPDATE `tbl_product` SET `productname`=?,`slug`=?,`category`=?,`shortdesc`=?,`detaildesc`=?,`pieces`=?,`net_weight`=?,`price`=?,`sortorder`=?,`isnewarrival`=?,`instock`=?,`isactive`=? where `id`=?', [params.productname, params.slug, params.category, params.shortdesc, params.detaildesc, params.pieces, params.net_weight, params.price, params.sortorder, params.isnewarrival, params.instock, params.isactive, params.id], function (error, results, fields) {
                if (error) throw error;
                if(params.stockin.length > 0) 
                  {
                    connection.query('DELETE FROM `tbl_location_stock` WHERE pid='+params.id, function (error, results, fields) {
                      if (error) throw error;
                      params.stockin.forEach(newelement => {
                        if(params.stockin.length==1 && newelement=='')
                        {
                          res.send({Message:"success"});
                        }
                        else
                        {
                          callbackCounter++;
                          if(newelement!='')
                          {
                            connection.query('INSERT INTO `tbl_location_stock` SET `pid`=?,`location`=?,`instock`=?', [params.id, newelement, '1'], function (error, Insertresults, fields) {
                              if (error) throw error;
                              if(params.stockin.length == callbackCounter)
                              {
                                res.send({Message:"success"});
                              }
                            });
                          }
                        }
                      });
                    });
                  }
                else
                  {
                    res.send({Message:"success"});
                  }
              });
            }
          });
      }
      else
      {
        return res.send({ Message: 'Product productname already exist. !!!'})
      }
    });
  });
  
  //rest api to delete record from mysql database
  app.post('/deletedata', function (req, res) {

    connection.query('select productimage from tbl_product where id='+req.body.id, function (error, results, fields) {
      if (error) throw error;
      if(results.length)
      {
        var newstring=JSON.stringify(results);
        var newjson =  JSON.parse(newstring);
        oldproductimage = newjson[0].productimage;

        const unlinkimagepath = 'public/uploads/productimage/'+oldproductimage;
       // console.log(unlinkimagepath);
        fs.unlink(unlinkimagepath, (err) => {});
      }

      connection.query('DELETE FROM `tbl_location_stock` WHERE pid='+req.body.id, function (error, results, fields) {
        if (error) throw error;
        connection.query('DELETE FROM `tbl_product` WHERE id='+req.body.id, function (error, results, fields) {
          if (error) throw error;
            res.json({ Message:"success"});
        });
      });
    });
    
  });

  //rest api to get all location
  app.get('/all_active_location', function (req, res) {
    connection.query('select * from tbl_city_master where isactive=1 order by city asc', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get count of product into mysql database
  app.get('/GetProductsCount', function (req, res) {
    connection.query('select count(id) as productCount from tbl_product', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });
  
  module.exports = app;