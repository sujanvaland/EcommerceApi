const express = require('express');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');
const js_sha512_1 = require("js-sha512");
var request = require('request');
var SendSMSURL='http://dnd.smssetu.co.in/smsstatuswithid.aspx';
var SMSusername='9687268055';
var SMSpassword='TDM055VDR';
var SMSsenderId='TDMEAT';
var adminPhone='9687268055';
//var adminPhone='9998216456';

//Web Push Notification
const webpush = require('web-push');
//const vapidKeys = webpush.generateVAPIDKeys();
// Prints 2 URL Safe Base64 Encoded Strings
//console.log(vapidKeys.publicKey, vapidKeys.privateKey);
const publicKey='BGSRPUaWVfh-VvVo6nkKDZtV4JKhi5uN1GG4JqWhV6Yhtbo6PLgp4F8VwuFNeBC8sixv63fLUCpUn4cjMFJEJ7c';
const privateKey='TIGX6ZvZ1sTGhW1amBCXjYqBp4v-41mrLddOtrUS5Gc';
webpush.setVapidDetails(
  'mailto:thedailymeat786@gmail.com',
  publicKey,
  privateKey
);

const sub= {
              endpoint:"https://fcm.googleapis.com/fcm/send/c-XuqgJqZbE:APA91bGSWh7PZhaW8t413gcAr9qfL98r5KYV7hDuRxenkAolPCEei8ZypW7RZ-IZKOJkFDFeQPCon2MsOLbnXMqCbzLRl-qGr2zsUdd8RV79JPCRAN1ZMln5gsc4mk5uXX4D_Dxb4U_n",
              expirationTime:null,
              keys:{
                      p256dh:"BIKXR2fXSPNh7QjxUxyeQuIIThtcuh8mt5r3eohFNLibYmJQll4ROP2WcJGr2lrb1iL4xR5ZAT4Icv7_T6FElmU",
                      auth:"lcob2oCHCCa0_zY-pr_OVg"
              }
            };


  
  //rest api to add cart data
  app.post('/addtocart', function (req, res) {
    var params  = req.body;
    connection.query('select id,qty from tbl_cart where pid="'+params.pid+'" and userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if(results.length == 0)
      {
        params.userguid=req.headers.customerguid;
        connection.query('INSERT INTO `tbl_cart` SET `pid`=?,`userguid`=?,`qty`=?', [params.pid, params.userguid, params.qty], function (error, Insertresults, fields) {
          if (error) throw error;
          res.json({ Message:"success",Insertresults});
        });
      }
      else
      {
        old_qty=results[0].qty;
        if(params.mode=="remove")
        {
          new_qty=0;
          if(old_qty > 0)
          {
            new_qty=(old_qty - 0) - (params.qty - 0);
          }
          
        }
        else
        {
          new_qty=(old_qty - 0) + (params.qty - 0);
        }

        if(new_qty > 0)
        {
          connection.query('update tbl_cart set qty='+new_qty+' where id = "'+results[0].id+'"', function (error, results, fields) {
            if (error) throw error;
            res.json({ Message:"success",results});
          });
        }
        else
        {
          connection.query('DELETE FROM tbl_cart WHERE id = "'+results[0].id+'"', function (error, results, fields) {
            if (error) throw error;
            res.json({ Message:"success",results});
          });
        }
      }
    });
  });

  //rest api to get all cart item by userguid
  app.get('/getcartitems', function (req, res) {

    var sql = "SELECT tbl_cart.id,tbl_cart.pid,tbl_cart.qty, tbl_product.productname AS productname, tbl_product.productimage AS productimage, tbl_product.price as unitprice,(tbl_product.price*tbl_cart.qty) as pprice FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
    
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         res.json({ Message:"success",results});
       });
  });

  //rest api to get all cart item by userguid
  app.post('/getproductitemcount', function (req, res) {
    var sql = "SELECT qty from tbl_cart where userguid='"+req.headers.customerguid+"' and pid='"+req.body.pid+"'";
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         if(results.length == 0)
         {
           results=[{ 'qty' : 0 }];
         }
        res.json({ Message:"success",results});
         
    });
  });

  //rest api to get all cart Count by userguid
  app.get('/getcartcount', function (req, res) {

    var sql = "SELECT sum(qty) as totalcartcount FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;

         var totalcartcount=0;
         if(results[0].totalcartcount > 0)
         {
          totalcartcount=results[0].totalcartcount;
         }
         res.json({ Message:"success",totalcartcount:totalcartcount});
       });
  });


  //rest api to get paymentobject
  app.post('/paymentobject', function (req, res) {
    var params  = req.body;
    var sql = "SELECT * from tbl_payu_config where isactive='1'";
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         if(results.length == 0)
          {
            res.json({ Message:"error",error_message:"Something Went Wrong. Please Try Again."});
          }
          else
          {
            $key=results[0].apikey;
            $salt=results[0].apisalt;
            $merchantId=results[0].merchantId;

            $txnId=params.txnId.toString();
            $amount=params.finaltotal.toString();
            $productinfo=params.productName;
            $firstname=params.firstname.trim();
            $email=params.email;
            $phone=params.phone;

            $hash=gethash($key,$amount,$email,$txnId,$productinfo,$firstname,$salt);
            
            $payData = {
                amount: $amount,
                txnId: $txnId,
                productName: $productinfo,
                firstName: $firstname,
                email: $email,
                phone: $phone,
                merchantId: $merchantId,
                key: $key,
                successUrl: 'https://www.payumoney.com/mobileapp/payumoney/success.php',
                failedUrl: 'https://www.payumoney.com/mobileapp/payumoney/failure.php',
                isDebug: false,
                hash:$hash,
            }
            res.json({ Message:"success",payData:$payData}); 
          }
    });
  });

  function gethash(key, amount, email, txnId, productName, firstName, salt, udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "", udf6 = "", udf7 = "", udf8 = "", udf9 = "", udf10 = "")
  {
    const hashString = `${key}|${txnId}|${amount}|${productName}|${firstName}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${salt}`;
    return js_sha512_1.sha512(hashString);
  }

  //rest api to Place Order data
  app.post('/placeorder', function (req, res) {
    var params  = req.body;
    var sql = "SELECT tbl_cart.id,sum(tbl_product.price*tbl_cart.qty) as subtotal FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0)
      {
        res.json({ Message:"error",error_message:"There are no items into cart. Please Try Again."});
      }
      else
      {
        connection.query('select id,addresstype,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault,latitude,longitude,(select phone from tbl_registration where userguid=tbl_manage_address.userguid) as loginphone from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+req.body.addressid+'"', function (error, addressresults, fields) {
          if (error) throw error;
          if(addressresults.length > 0)
          {
            var bphone=addressresults[0].bphone;
            if(addressresults[0].bphone=='')
            {
              bphone=addressresults[0].loginphone;
              // connection.query('select phone from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, userresults, fields) {
              //   if (error) throw error;
              //   if(userresults.length > 0)
              //   {
              //     bphone=userresults[0].phone;
              //   }
              // });
            }
            
            var paymentstatus="";
            var transactionid="";
            var responsedata="";
            var orderstatus = 1;
            if(req.body.paymenttype==2)
            {
               var paymentdata = req.body.paymentdata;
               //console.log(paymentdata);
               if(paymentdata.success)
               {
                  var paymentstatus=paymentdata.response.result.status;
                  var transactionid=paymentdata.response.result.txnid;
                  var responsedata=paymentdata.response.toString();
               }
               else
               {
                 var paymentstatus="failed";
                 var orderstatus = 6;
               }
            }

            
            var subtotal=results[0].subtotal;
            var deliverycharge=0;
            if(subtotal < 300)
            {
              deliverycharge=40;
            }
            
            var ordertotal=(subtotal - 0) + (deliverycharge - 0);
            var orderguid=uuidv1();

            var newparams={
              "addresstype":addressresults[0].addresstype,
              "firstname":addressresults[0].bfirstname,
              "lastname":addressresults[0].blastname,
              "phone":bphone,
              "email":'',
              "door_no_build_no_street":addressresults[0].door_no_build_no_street,
              "locality":addressresults[0].locality,
              "landmark":addressresults[0].landmark,
              "city":addressresults[0].bcity,
              "zipcode":addressresults[0].bzipcode,
              "latitude":addressresults[0].latitude,
              "longitude":addressresults[0].longitude,
              "orderguid":orderguid,
              "ordertotal":ordertotal,
              "userguid":req.headers.customerguid,
              "subtotal":subtotal,
              "paymenttype":req.body.paymenttype,
              "grandtotal":ordertotal,
              "deliverycharge":deliverycharge,
              "orderstatus":orderstatus,
              "orderdate": new Date(),
              "paymentstatus":paymentstatus,
              "transactionid":transactionid,
              "responsedata":responsedata
            }
            
            // For Insert Order
            connection.query('INSERT INTO `tbl_order` SET ?', newparams, function (error, Insertresults, fields) {
              if (error) throw error;
              // For Insert Order Items
              if(Insertresults.insertId > 0)
              {
                connection.query('select orderguid from tbl_order where id="'+Insertresults.insertId+'"', function (error, orderresults, fields) {
                  if (error) throw error;
                  if(orderresults.length)
                  {
                    var orderitemsql ="insert into tbl_orderitem(pid,productname,pieces,net_weight,productimage,orderguid,qty,pprice,unitprice,mainprice) select pid,(select productname from tbl_product where id=tbl_cart.pid) as productname,(select pieces from tbl_product where id=tbl_cart.pid) as pieces,(select net_weight from tbl_product where id=tbl_cart.pid) as net_weight,(select productimage from tbl_product where id=tbl_cart.pid) as productimage,'"+orderguid+"',qty,((select price from tbl_product where id=tbl_cart.pid)*qty) as pprice,(select price from tbl_product where id=tbl_cart.pid) as unitprice,(select price from tbl_product where id=tbl_cart.pid) as mainprice from tbl_cart where userguid='"+req.headers.customerguid+"'";
                    connection.query(orderitemsql, function (error, InsertItemresults, fields) {
                        if (error) throw error;
                        var changedate= new Date();
                        connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [orderstatus, orderresults[0].orderguid, req.headers.customerguid, changedate], function (error, Insertresultsorderstatus, fields) {
                          if (error) throw error;

                          if(paymentstatus=="failed")
                              {
                                var SendMessage="Your Order No. "+Insertresults.insertId+" has not been confirmed. please try again later.: TDM";
                                var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+bphone+"&msg="+SendMessage;
                                  //res.json({ Message:"error",SendUrl}); 
                                  request(SendUrl, function (error, response) {
                                    res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                                  });
                                  res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                              }
                              else
                              {
                                  // For Delete Cart
                                  connection.query('DELETE FROM tbl_cart WHERE userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
                                    if (error) throw error;
                                    if(paymentstatus=="failed")
                                    {
                                      
                                      var SendMessage="Your Order No. "+Insertresults.insertId+" has not been confirmed. please try again later.: TDM";
                                      //var SendMessage="Your Order No. "+Insertresults.insertId+" has been placed Failed.";
                                    }
                                    else
                                    {
                                      
                                      var SendMessage="Your Order No. "+Insertresults.insertId+" has been placed successfully. Thank you for shopping with us. Hope your experience with us will be as fresh and delicious as our product. : TDM";
                                      //var SendMessage="Your Order No. "+Insertresults.insertId+" has been placed success.";
                                    }
                                    
                                    var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+bphone+"&msg="+SendMessage;
                                    //res.json({ Message:"error",SendUrl}); 
                                    request(SendUrl, function (error, response) {
                                      //if (error) throw new Error(error);
                                      //res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                                      if(paymentstatus!="failed")
                                      {
                                        var phone=adminPhone;
                                        if(phone!='')
                                        {
                                          // For Web Push Notification
                                          const payload = JSON.stringify({
                                            notification: {
                                              title: 'New Order',
                                              body: "Order No. "+Insertresults.insertId+" has been placed successfully. please confirm.",
                                              vibrate: [100, 50, 100],
                                              data: {
                                                orderguid: orderguid,
                                                url:process.env.MAIN_SITE_URL
                                              }
                                            }
                                          });
                                          webpush.sendNotification(sub, payload)
                                            .catch(error => console.error(error));

                                          // For SMS Notification
                                          var SendAdminMessage="Order No. "+Insertresults.insertId+" has been placed successfully. please confirm.: TDM";
                                          //var SendAdminMessage="Order No. "+Insertresults.insertId+" has been placed success.";
                                          var SendAdminUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+phone+"&msg="+SendAdminMessage;
                                          request(SendAdminUrl, function (error, response) {
                                            res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                                          });
                                        }
                                      }
                                    });
                                    res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                                  });

                              }
                        });
                    });
                  }
                  else
                  {
                    res.json({ Message:"error",error_message:"Something went wrong. Please try again."});
                  }
                });
              }
              else
              {
                connection.query('DELETE FROM tbl_order WHERE id="'+Insertresults.insertId+'"', function (error, results, fields) {
                  if (error) throw error;
                  res.json({ Message:"error",error_message:"Something went wrong. Please try again."});
                });
              }
              
            });
          }
          else
          {
            res.json({ Message:"error",error_message:"Please select atleast one address."});
          }
        });
        
      }
    });
  });

  //rest api to get all orders Customer Wise
  app.post('/orderbyuserguid', function (req, res) {
    var callbackCounter = 0;
    connection.query('select * from tbl_order where userguid="'+req.headers.customerguid+'" order by id desc', function (error, results, fields) {
        if (error) throw error;
        if(results.length)
          {
            let orders = [];
            results.forEach(element => { 
              connection.query('select * from tbl_orderitem where orderguid="'+element.orderguid+'"', function (error, itemresults, fields) {
                if (error) throw error;
                element.orderitems = [];
                itemresults.forEach(newelement => {
                  element.orderitems.push(newelement);
                });
                orders.push(element);
                callbackCounter++;
                if(results.length == callbackCounter)
                {
                  res.send({Message:"success",orders});
                }
              });
            });
          }
          else
          {
            res.send({Message:"No Orders in List"});
          }
     });
  });


  //rest api to Re-Order.
  app.post('/reorder', function (req, res) {
    var callbackCounter = 0;
    var productresultsCounter = 0;
    connection.query('select pid,qty from tbl_orderitem where orderguid="'+req.body.orderguid+'"', function (error, results, fields) {
        if (error) throw error;
        if(results.length > 0)
        {
          results.forEach(element => { 
            connection.query('select * from tbl_product where id="'+element.pid+'" and id IN (select pid from tbl_location_stock where instock=1 and pid="'+element.pid+'" and location="'+req.headers.location+'")', function (error, productresults, fields) {
              if (error) throw error;
              if(productresults.length > 0)
              {
                productresultsCounter++;
                connection.query('select id,qty from tbl_cart where pid="'+productresults[0].id+'" and userguid="'+req.headers.customerguid+'"', function (error, cartitemresults, fields) {
                  if(cartitemresults.length == 0)
                  {
                    connection.query('INSERT INTO `tbl_cart` SET `pid`=?,`userguid`=?,`qty`=?', [productresults[0].id, req.headers.customerguid, element.qty], function (error, Insertresults, fields) {
                      if (error) throw error;
                    });
                  }
                  else
                  {
                    old_qty=cartitemresults[0].qty;
                    new_qty=(old_qty - 0) + (element.qty - 0);
            
                    if(new_qty > 0)
                    {
                      connection.query('update tbl_cart set qty='+new_qty+' where id = "'+cartitemresults[0].id+'"', function (error, cartupdateresults, fields) {
                        if (error) throw error;
                      });
                    }
                    else
                    {
                      connection.query('DELETE FROM tbl_cart WHERE id = "'+cartitemresults[0].id+'"', function (error, deletecartresults, fields) {
                        if (error) throw error;
                      });
                    }
                  }
                });
              }
              callbackCounter++;
              if(results.length == callbackCounter)
              {
                if(productresultsCounter > 0)
                {
                   res.send({Message:"success"});
                }
                else
                {
                  res.send({Message:"Some of reason you can't reorder this items."});
                }
              }
            });
          });
        }
        else
        {
          res.send({Message:"No Items in this Order."});
        }
     });
  });

  //rest api to get Order Detail
  app.post('/orderdetail', function (req, res) {
    
    connection.query('select *,(select phone from tbl_registration where userguid=tbl_order.staff_id) as delivery_phone from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, results, fields) {
        if (error) throw error;
        if(results.length)
          {
            res.json({ Message:"success",results});
          }
          else
          {
            res.send({Message:"No Orders in List"});
          }
     });
  });

  //rest api to send feedback
  app.post('/sendfeedback', function (req, res) {
    var sql = "SELECT id from tbl_order where userguid='"+req.headers.customerguid+"' and id='"+req.body.orderID+"'";
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         if(results.length > 0)
         {
          connection.query('UPDATE `tbl_order` SET `feedback`=?,`rating`=? where `id`=?', [req.body.feedback, req.body.rating, req.body.orderID], function (error, results, fields) {
            if (error) throw error;
            res.json({Message:"success"});
          });
         }
         else
         {
          res.send({Message:"No Orders in List"});
         }
    });
  });

  
  module.exports = app;