const { request, response } = require("express");
var asyncLoop = require("node-async-loop");
const common = require("../../../config/common");
const GLOBALS = require("../../../config/constant");
const emailtemplate = require("../../../config/template");
const language=require("../../../language/en")
const language1=require("../../../language/gu")
con = require("../../../config/database");
const moment= require('moment') 
const users = require('../auth/modal.js');
const Auth = require("../auth/modal.js");

var Service = {

  review: (request, trainer_id, callback) => {

    var reviewadd = {
      trainer_id: request.trainer_id,
        rating: request.rating,
        review:request.review,
       
    }
    var sql = `insert into tbl_trainer_review set ? `
    // console.log(paymentdetails)
    con.query(sql, [reviewadd], (error, result) => {
        if (!error) {
            Service.reviewdetail(result.insertId, (cardetail) => {
  
                callback('1', { keyword: "review added", content: {} }, cardetail)
            })
  
        } else {
            callback('0', { keyword: "review not add", content: {} }, { error })
  
        }
    })
  },
  
  reviewdetail: (user_id, callback) => {
    con.query(
      `SELECT * FROM tbl_trainer_review where id=?`,
      [user_id],
      (error, result) => {
        // console.log(error)
        var userdata = result[0];

        if (!error && result.length > 0) {
          callback(userdata);
        } else {
          callback(userdata);
        }
      } 
    );
  },
  
  // myreviews

  myreviews: (request,page,limit, callback) => {
    // console.log(paymentdetails)
    con.query(` Select u.id,u.profile_image,u.first_name,u.last_name,u.rating,location,u.speciality,u.review,
    CASE
        WHEN TIMESTAMPDIFF(SECOND,tr.created_at,NOW())<60 THEN CONCAT
        (TIMESTAMPDIFF(SECOND,tr.created_at,NOW()),' second ago')
        WHEN TIMESTAMPDIFF(MINUTE,tr.created_at,NOW())<60 THEN CONCAT
        (TIMESTAMPDIFF(MINUTE,tr.created_at,NOW()),' minute ago')
        WHEN TIMESTAMPDIFF(HOUR,tr.created_at,NOW())< 24 THEN CONCAT(TIMESTAMPDIFF
        (HOUR,tr.created_at,NOW()),' hour ago')
        WHEN TIMESTAMPDIFF(DAY,tr.created_at,NOW())< 365 THEN CONCAT(TIMESTAMPDIFF(DAY,tr.created_at,now()),' day ago')
        ELSE
        (date_format(tr.created_at,'%b %d %Y'))
        END AS review_created_date
    from  tbl_user u join tbl_trainer_review tr on u.id=tr.trainer_id WHERE tr.user_id=${request.user_id} Group by tr.trainer_id order by tr.review DESC  limit ${limit} offset ${(page-1)*limit}`,(error, result) => {
        if (!error) {
          console.log(error)
            // Service.reviewdetail(result.insertId, (cardetail) => {
  
                callback('1', { keyword: "my reviews show ", content: {} }, result)
            // })
  
        } else {
            callback('0', { keyword: " your reviews not found ", content: {} }, { error })
  
        }
    })
  },
  
  // block trainer
  blocktariner: (request, trainer_id, callback) => {

    var blockadd = {
       trainer_id: request.trainer_id,
        user_id: request.user_id,
        // review:request.review,
       
    }
    var sql = `insert into tbl_trainer_block set ? `
    // console.log(paymentdetails)
    con.query(sql, [blockadd], (error, result) => {
        if (!error) {
            Service.getuserdetails(result.insertId, (cardetail) => {
  
                callback('1', { keyword: "trainer block ", content: {} }, cardetail)
            })
  
        } else {
            callback('0', { keyword: "trainer not block", content: {} }, { error })
  
        }
    })
  },

  blocktarinerdetails: (request, user_id, callback) => {

   
    con.query(`Select tb.trainer_id,u.first_name,u.first_name,u.profile_image,u.speciality from tbl_trainer_block tb join tbl_user u on u.id=tb.trainer_id`,[user_id],(error, result) => {
        if (!error) {
            // Service.getuserdetails(result.insertId, (cardetail) => {
  
                callback('1', { keyword: "trainer block  show for particuler user", content: {} }, result)
            // })
  
        } else {
            callback('2', { keyword: "Not found", content: {} }, { error })
  
        }
    })
  },


  searchdetails: (request, callback) => {
    con.query(
      `SELECT first_name,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.user}',profile_image) as image,role,speciality FROM tbl_user where speciality LIKE '%${request.search}%' OR role LIKE '%${request.role}%'`,
      (error, result) => {
        console.log(error)
        if (!error && result.length > 0) {
          callback("1", { keyword: "search item succesfully displayed", content: {} }, result);
        } else {
          callback("0", { keyword: "Not Your your request ! please try again ", content: {} }, {});
        }
      }
    );
  },
  
  trainerprofile: (request, callback) => {
    con.query( `Select tr.trainer_id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.post}',u.profile_image) sender_profile,CONCAT (u.first_Name , ' ', u.last_name) AS Name ,u.per_session_price,u.rating,location,u.speciality,tr.review  from  tbl_user u join tbl_trainer_review tr on u.id=tr.trainer_id  where trainer_id =${request.trainer_id} group by tr.trainer_id`,(error, result) => {
        console.log(request.trainer_id)
        if (!error ) {
          console.log('error1111:',error)
          callback("1", { keyword: "Trainer profile show ", content: {} }, result);
        } else {
          callback("0", { keyword: "Not found  trainer details", content: {} }, {});
        }
      }
    );
  },
  // map view
  mapview: (request, callback) => {
    Service.getuserdetails(request,(userdata)=>{
      console.log(userdata);
  
      con.query( `SELECT u.id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.post}',u.profile_image) sender_profile,CONCAT (u.first_Name , ' ', u.last_name) AS Name ,CONCAT(ROUND((6371 *acos(cos(radians(${userdata.latitude})) * cos(radians(u.latitude)) * cos(radians(${userdata.longitude}) - radians(u.longitude)) + sin(radians(${userdata.latitude})) * sin(radians(u.latitude)))), 2), ' km away') AS distance   FROM tbl_user u where u.role ='trainer' ORDER BY distance ASC`, (error, result) => {
      console.log(error);
        if (!error ) {
        callback("1", { keyword: " Nearby Trainers show ", content: {} }, result);
      } else {
        callback("0", { keyword: " Not found trainers", content: {} }, {});
      }
    })
  });
  },

  getuserdetails: (user_id,page,limit, callback) => {
    con.query(
      `SELECT id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.user}',profile_image) trainer_image,CONCAT(first_Name , ' ', last_name) AS Name,role,location,latitude,longitude,speciality from tbl_user where role ='trainer'`,
      [user_id],
      (error, result) => {
        console.log(error);
        var userdata = result[0];

        if (!error && result.length > 0) {
          callback(userdata);
        } else {
          callback(userdata);
        }
      }
    );
  },

// banner or homepage
homepage: (request,user_id,page,limit, callback) => {
  con.query(`SELECT b.trainer_id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.post}',u.profile_image) trainer_image,CONCAT (u.first_Name , ' ', u.last_name) AS Name ,u.speciality from tbl_banner b JOIN tbl_user u on u.id=b.trainer_id  `,[user_id],(error,result)=>{
    // console.log(result);
    if(!error  && result.length>0){
      Service.getuserdetails(request,page,limit,(userdata)=>{
     con.query(`SELECT u.id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.post}',u.profile_image) trainer_image,CONCAT (u.first_Name , ' ', u.last_name) AS Name ,CONCAT(ROUND((6371 *acos(cos(radians(${userdata.latitude})) * cos(radians(u.latitude)) * cos(radians(${userdata.longitude}) - radians(u.longitude)) + sin(radians(${userdata.latitude})) * sin(radians(u.latitude)))), 2), ' km away') AS distance,u.rating,u.speciality   FROM tbl_user u where u.role ='trainer' ORDER BY distance ASC  limit ${limit} offset ${(page-1)*limit}`, (error, result1) => {
      //  result.banner = result1
       if (!error ) {
         callback("1", { keyword: " homepage show ", content: {} }, {result,result1});
        } else {
          callback("0", { keyword: " Not found homepage data", content: {} }, {});
        }
      })
        
    })
    }
  })
},

// fiter or sorting



  




   


  
  
};

module.exports = Service;
