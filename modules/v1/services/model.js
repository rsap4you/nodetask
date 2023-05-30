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
var randomtoken = require('rand-token').generator();
var usersession = randomtoken.generate(64,'0123456789abcdefghijklmnopqrstuvwxyz')

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
    con.query(` Select u.id,u.profile_image,u.first_name,u.last_name,u.rating,location,u.speciality,u.review,tr.review,
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
            Service.getuserdetailss(result.insertId, (code, message, userdata) => {
  
              console.log('userdata:',userdata)
                callback('1', { keyword: "trainer block ", content: {} }, userdata)
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

  // unblock trainer
  // block trainer
  unblocktariner: (request, trainer_id, callback) => {
    var sql = `delete from  tbl_trainer_block where trainer_id =? `
    // console.log(paymentdetails)
    con.query(sql,[request.trainer_id],  (error, result) => {
        if (!error) {
            Service.getuserdetailss(result.insertId, (code,message,userdata) => {
  
                callback('1', { keyword: "trainer Unblock ", content: {} },userdata)
            })
  
        } else {
            callback('0', { keyword: "trainer not unblock", content: {} }, { error })
  
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

  getuserdetailss: (user_id, callback) => {
    con.query(
      `SELECT id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.user}',profile_image) trainer_image,CONCAT(first_Name , ' ', last_name) AS Name,role,location,latitude,longitude,speciality from tbl_user where role ='trainer'`,
      [user_id],
      (error, result) => {
        var userdata = result[0];
        // console.log(userdata);

        if (!error && result.length > 0) {
          callback('1',{keyword:"show details",content:{}},userdata);
        } else {
          callback('0',{keyword:" not show details",content:{}},userdata);
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

Filter: (request, callback) => {

  //search
  if (request.search != undefined && request.search != '') {

      var search_value = `and u.speciality like '%${request.search}%'`

  } else {
      search_value = ''
  }

  //price
  if (request.start_price != "" && request.end_price != undefined) {

      var price = ` and u.per_session_price between ${request.start_price} and ${request.end_price} `
  } else {
      price = ''
  }

  //start-time & end-time
  if ((request.start_time != undefined && request.start_time != "") && (request.end_time != undefined && request.end_time != "")) {

      var session = ` AND s.book_from_slot >= "${request.start_time}" AND s.book_to_slot <= "${request.end_time}"`

  } else {
      session = ``
  }

  //trainer type
  if (request.trainer_type != "" && request.trainer_type != undefined) {

      var trainer = `AND u.trainer_type = '${request.trainer_type}' `

  } else {
      trainer = ''
  }

  //distance
  if (request.distance != "" && request.distance != undefined) {

      var distance = `having distance <='${request.distance}' order by distance ASC`
  } else {
      distance = ''
  }


  //sortin new-page
  var condition;
  var sortin = request.sortin;
  var sortby = request.sortby

  if (request.sortby != undefined) {

      if (sortby == 'distance') {
          if (sortin == 'ASC') {
              condition = `HAVING distance ORDER BY distance ASC`;
          } else {
              condition = `HAVING distance ORDER BY distance DESC`;
          }
      }

      if (sortby == 'rating') {
          if (sortin == 'DESC') {
              condition = `ORDER BY u.rating DESC`;
          } else {
              condition = `ORDER BY u.rating ASC`;
          }
      }

      if (sortby == 'price') {
          if (sortin == 'DESC') {
              condition = `ORDER BY u.per_session_price DESC`;
          } else {
              condition = `ORDER BY u.per_session_price ASC`;
          }
      }
  } else {
      condition = ``;
  }

  Service.getuser(request, (userDetials) => {
      // console.log(userDetials);
      var sql = `SELECT u.id,u.first_name,u.last_name,u.email,u.gender,u.location,u.experience,u.trainer_type,u.speciality,u.rating,u.per_session_price, CONCAT(ROUND((6371 * acos(cos(radians(${userDetials.latitude})) * cos(radians(u.latitude)) * cos(radians(${userDetials.longitude}) - radians(u.longitude)) + sin(radians(${userDetials.latitude})) * sin(radians(u.latitude)))), 2), ' km away') AS distance,s.book_from_slot,s.book_to_slot  FROM tbl_user u JOIN tbl_slot s  on s.trainer_id=u.id where u.role = 'trainer'  ${distance} ${price} ${session} ${search_value} ${trainer}`
    // (ON s.trainer_id = u.id )  CONDITION ON JOIN 
      // console.log('usersssss:',userDetials);
      sql+=condition;
      con.query(sql, (error, result) => {
    //  console.log(sql);
          if (!error && result[0]!=null ) {
              // console.log('divyyayaa:',error)
              callback('1', { keyword: 'Filter Page Data Found', content: {} }, result)

          } else {
              // console.log(error);
              console.log('divyyayaa:',error) 
              callback('0', { keyword: 'Filter Page Data Not Found', content: {} }, {})
          }
      })
  })
},

getuser: (user_id, callback) => {
  con.query(`SELECT id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.user}',profile_image) trainer_image,CONCAT(first_Name , ' ', last_name) AS Name,role,location,latitude,longitude,speciality from tbl_user where role ='trainer'`,[user_id], (error, result) => {
      console.log('error111:',result[0]);
      var userDetials = result[0];

      if (!error && result.length > 0) {
        callback(userDetials);
      } else {
        callback(userDetials);
      }
    }
  );
},

// BOOK TRAINER

booktrainer : (request,user_id,callback) => {
  // console.log(request.trainer_id)
  con.query(`SELECT ta.* FROM tbl_trainer_availability ta WHERE ta.trainer_id = ? AND "${request.book_date}" BETWEEN from_date AND to_date;`,[request.trainer_id],(error,result) => {
      // console.log(error);
      if (!error && result.length > 0) {
        // console.log('eroorrrr',error)
          con.query(`SELECT
          ts.id,
          ts.trainer_id,
          TIME_FORMAT(ts.book_from_slot, '%H:%i %p') AS start,
          TIME_FORMAT(ts.book_to_slot, '%H:%i %p') AS end,
          CASE
              WHEN COUNT(b.slot_id) >= 1 THEN 'booked'
              ELSE 'Available'
          END AS slot_availability
      FROM
     tbl_trainer_availability ta
      JOIN
          tbl_slot ts ON ta.id = ts.availability_id
      LEFT JOIN
          tbl_booking b ON ts.id = b.slot_id AND b.booking_date = '${request.book_date}'
      WHERE
          ta.trainer_id = ${request.trainer_id}
          AND '${request.book_date}' BETWEEN ta.from_date AND ta.to_date
      GROUP BY
          ts.id, ts.trainer_id, b.user_id, b.booking_date, ts.book_from_slot, ts.book_to_slot;`,(error,result1)=>{
              // console.log(result1);
              if (!error && result1.length > 0) {
                  if (request.book_slot != undefined) {
                      
                      asyncLoop(request.book_slot, (slot, next) => {
                          // query
                          con.query(`SELECT id,user_id,trainer_id,slot_id,DATE_FORMAT(booking_date,'%Y-%m-%d') as booking_date,session_amount,convenience_amount,payment_status,booking_status,payment_type,card_id,trainer_id FROM tbl_booking WHERE slot_id = ?`,[slot],(error,result2)=>{
                              console.log(result[0].booking_date);
                              // console.log('reeeeeeeee:',error);
                              users.gettrainerdetails(request.trainer_id,(trainerData)=>{
                                  // console.log('trainerdata:',trainerData);
                                  if (trainerData == null) {
                                      callback('2',{keyword:"rest_keyword_trainer_data_null"},{})
                                  } else {
                                      if (!error && result2.length > 0 && result2 != undefined && result2[0].booking_date == request.book_date) {
                                          next();
                                      } else {
                                          
                                     var transaction_id  = randomtoken.generate(8,"1234567890")
                                          var bookSlotData = {
                                              user_id : user_id,
                                              trainer_id : request.trainer_id,
                                              slot_id : request.book_slot,
                                              // location_id : request.location_id,
                                              location_type:request.location_type,
                                              address_1:request.address_1,
                                              address_2:request.address_2,
                                              zip_code:request.zip_code,
                                              booking_date : request.book_date,
                                              session_amount : trainerData.per_session_price,
                                              convenience_amount : 5,
                                              total_amount : trainerData.per_session_price + 5,
                                              payments_status : "paid",
                                              booking_status : "pending",
                                              transaction_id : transaction_id,
                                              payment_type : request.payment_type,
                                              card_id : request.card_id
                                            }
                                          con.query(`INSERT INTO tbl_booking SET ?`,[bookSlotData],(error,response)=>{
                                              console.log(error);
                                            if (!error) {
                                              Service.orderdetails(response.insertId,(orderData)=>{
                                                  if (orderData == null) {
                                                      callback('2',{keyword: "not found "},{})
                                                  } else {
                                                    console.log('error')
                                                      callback('1',{keyword:"slot booking confirm"},orderData)
                                                  }
                                              })
                                            } else {
                                              callback('0',{keyword:"slot booking not confirm"},{})
                                            }
                                          })
                                      }
                                  }
                              })
                             
                          });
                      }, () => {
                          callback("1", {keyword: "slot already booked"},{});
                      })
                  } else {
                      callback('1',{keyword:'rest_keyword_slot'},result1)
                  }
              } else {
                console.log('errrrrrreeeeeeee:',error)
                  callback('0',{keyword:'rest_keyword_data_null'},{}) 
              }
          })
      } else {
        console.log('sloterror:',error)
          callback('0',{keyword:'last me gya'},{})
      }
  })
},

orderdetails: (user_id, callback) => {
  con.query(`SELECT c.card_number,b.id as booking_id,b.slot_id,b.booking_date,b.payments_status,b.session_amount,b.convenience_amount,b.total_amount,b.payment_status, b.booking_status,b.location_type,b.address_1,b.address_2,b.zip_code,b.transaction_id,b.created_at from tbl_booking b join tbl_card c on b.id=c.id`,[user_id], (error, result) => {
    console.log('error111:',error);
    var userDetials = result[0];
    
    if (!error && result.length > 0) {
        callback(userDetials);
      } else {
        callback(userDetials);
      }
    }
  );
},

//  running booking

runningbooking: (request,user_id, callback) => {
  con.query(`SELECT u.id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.post}',u.profile_image) as image,u.rating,concat(u.first_name,' ',u.last_name) as name ,b.slot_id,u.per_session_price,b.booking_date,CONCAT(TIME_FORMAT(s.book_from_slot,'%H:%i %p'),' - ',TIME_FORMAT(s.book_to_slot,'%H:%i %p') ) as booking_time,b.location_type,u.location,u.per_session_price,b.convenience_amount,b.total_amount FROM tbl_booking b JOIN tbl_slot s on s.trainer_id=b.trainer_id 
  JOIN tbl_user u on u.id=b.user_id WHERE b.payments_status='paid' and b.booking_status ='pending' GROUP BY b.id`,[user_id], (error, result) => {
    console.log('error111:',error);
    var userDetials = result[0];
    
    if (!error && result.length > 0) {
        callback('1',{keyword:"order details found",content:{}},userDetials);
      } else {
        callback('0',{keyword:"order  details not  found",content:{}},{});
      }
    }
  );
},

//  accept order
acceptedbooking: (request,trainer_id, callback) => {
  con.query(`UPDATE tbl_booking SET booking_status='accepted' WHERE id = ${request.order_id} AND trainer_id =${request.trainer_id}`,(error, result) => {
    console.log(error)
    if(!error){

  Service.acceptedbookingdetails(trainer_id,(bookingdetails)=>{
    // console.log(userdetails);
        callback("1",{keyword:"Order Accepted",content:{}},bookingdetails)
  })
    }else{
      callback("0",{keyword:"Order Not Accepted ",content:{}},{})
    }
   
  }
      
  );
},
//  cancel order
cancelbooking: (request,trainer_id, callback) => {
  con.query(`Delete from tbl_booking  WHERE id = ${request.order_id} AND trainer_id =${request.trainer_id}`,(error, result) => {
    console.log(error)
    if(!error){

  Service.acceptedbookingdetails(trainer_id,(bookingdetails)=>{
    // console.log(userdetails);
        callback("1",{keyword:"Cancel Booking order ",content:{}},bookingdetails)
  })
    }else{
      callback("0",{keyword: "Booking Not Found",content:{}},{})
    }
   
  }
      
  );
},

acceptedbookingdetails: (trainer_id, callback) => {
  con.query(`SELECT u.id,CONCAT('${GLOBALS.PORT_BASE_URL}','${GLOBALS.post}',u.profile_image) as image,u.rating,concat(u.first_name,' ',u.last_name) as name ,b.slot_id,b.booking_date,CONCAT(TIME_FORMAT(s.book_from_slot,'%H:%i %p'),' - ',TIME_FORMAT(s.book_to_slot,'%H:%i %p') ) as booking_time,b.location_type,u.location,u.per_session_price,b.convenience_amount,b.total_amount FROM tbl_booking b JOIN tbl_slot s on s.trainer_id=b.trainer_id 
  JOIN tbl_user u on u.id=b.user_id WHERE b.payments_status='paid' and b.booking_status ='accepted' GROUP BY b.id`,[trainer_id], (error, result) => {
    // console.log('error111:',error);
    var userDetials = result[0];
    
    if (!error && result.length > 0) {
        callback(userDetials);
      } else {
        callback();
      }
    }
  );
},


//  my booking
myBooking: (request, user_id, callback) => {
  var condition;
  if (request.booking_status == "upcoming") {
      condition = ` AND b.booking_date > CURRENT_DATE`;
  }
  else if (request.booking_status == "running") {
      condition = ` AND CURRENT_DATE = b.booking_date `;
  }
  else {
      condition = ` AND b.booking_date < CURRENT_DATE`;
  }

  var sql = `SELECT b.id as booking_id,b.slot_id,u.profile_image,concat('${GLOBALS.PORT_BASE_URL}','${GLOBALS.user}',u.profile_image) as img_url,concat(u.first_name,' ',u.last_name) as full_name,concat(u.per_session_price,'/session') as session_fee,u.rating,concat(DATE_FORMAT(b.booking_date, "%d %b"),' - ',DATE_FORMAT(b.booking_date, "%d %b")) as booking_date,concat(DATE_FORMAT(ts.book_from_slot, "%h %p"),' - ',DATE_FORMAT(ts.book_to_slot, "%h %p")) as booking_time,concat(b.address_1,' ',b.city,' ',b.zip_code,' ',b.country) as training_place,b.total_amount,b.convenience_amount,b.booking_status,c.card_number FROM tbl_booking b 
  JOIN tbl_card c ON b.card_id = c.id
  JOIN tbl_user u ON b.trainer_id = u.id
  JOIN tbl_slot ts ON b.slot_id = ts.id
  WHERE b.user_id = ${user_id}`
  sql += condition;
  console.log('condition:',condition)
  con.query(sql, (error, result) => {
    // console.log(sql);
      if (!error && result.length > 0) {
          var order_details = result;
          callback("1", { keyword: 'My booking running screen displayed ', content: {} }, order_details);
      }
      else {
          console.log(error);
          callback("0", { keyword: 'Booking Data Not Found', content: {} }, null);
      }
  });
},

 //add notification
 addnotification: (request, callback) => {
  var data = {
      user_id: request.user_id,
      message: request.message
  }
  var sql = `insert into tbl_notification set ?`
  con.query(sql, [data], (error, result) => {
      if (!error) {
          Service.getnotification(result.insertId, (notification) => {
              callback('1', { keyword: 'notification added succes', content: {} }, notification)
          })
      } else {
        console.log(error)
          callback('0', { keyword: 'something went wrong', content: {} }, {})
      }
  })
},

getnotification: (id,callback)=>{
  var sql= `select id,message,TIME_FORMAT(created_at, '%H:%i %p') AS Time from tbl_notification where id=?`
  con.query(sql,[id],(error,result)=>{
    if(!error && result.length>0){
      callback(result[0])
    }
    else{
      callback([])
    }
  })
},
//notification
notification: (request, callback) => {
  var sql = `select n.message,
  CASE
      WHEN (TIMESTAMPDIFF(SECOND,n.created_at,CURRENT_TIMESTAMP())) < 60 THEN concat(TIMESTAMPDIFF(SECOND,n.created_at,CURRENT_TIMESTAMP()) ,' seconds ago')
      WHEN (TIMESTAMPDIFF(MINUTE,n.created_at,CURRENT_TIMESTAMP())) < 60 THEN concat(TIMESTAMPDIFF(MINUTE,n.created_at,CURRENT_TIMESTAMP()) ,' minutes ago')
      WHEN (TIMESTAMPDIFF(HOUR,n.created_at,CURRENT_TIMESTAMP())) < 24 THEN DATE_FORMAT(n.created_at, "%h:%i %p")
      WHEN ((TIMESTAMPDIFF(HOUR,n.created_at,CURRENT_TIMESTAMP())) > 24  AND (TIMESTAMPDIFF(HOUR,n.created_at,CURRENT_TIMESTAMP())) < 48) THEN "Yesterday"
      WHEN (TIMESTAMPDIFF(DAY,n.created_at,CURRENT_TIMESTAMP())) < 31 THEN concat(TIMESTAMPDIFF(DAY,n.created_at,CURRENT_TIMESTAMP()),' days ago')
      WHEN (TIMESTAMPDIFF(MONTH,n.created_at,CURRENT_TIMESTAMP())) < 12 THEN concat(TIMESTAMPDIFF(MONTH,n.created_at,CURRENT_TIMESTAMP()), ' months ago')
      ELSE concat(TIMESTAMPDIFF(YEAR,n.created_at,CURRENT_TIMESTAMP()),' years ago')
  END AS notification_time 
  from tbl_notification n WHERE user_id = ${request.user_id}`
  con.query(sql, (error, result) => {
    console.log(request.user_id)
      if (!error && result.length > 0) {
          callback('1', { keyword: 'show notification', content: {} }, result)
      } else {
          // console.log(error);
          callback('0', { keyword: 'something went wrong', content: {} }, {})
      }
  })
},




};

module.exports = Service;
