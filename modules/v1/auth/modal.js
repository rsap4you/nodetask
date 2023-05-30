const con = require("../../../config/database");
const comman = require("../../../config/common");
const common = require("../../../config/common");
var asyncLoop = require("node-async-loop");
const GLOBALS = require("../../../config/constant");

const emailtemplate = require("../../../config/template");
const { request } = require("express");
const cryptLib = require("cryptlib");
const bcrypt = require("bcrypt");
const middleware = require("../../../middleware/validator");

var Auth = {
  validator: (request, callback) => {
    Auth.checkEmailused(request, (isUsed) => {
      if (isUsed == null) {
        callback("2", { keyword: "rest_keyword_user_null", content: {} }, {});
      } else {
        var otp = comman.randomotp();
        comman.sendmail(
          request.email,
          "OTP Verification",
          `<h3>OTP : ${otp}</h3>`,
          (issent) => {
            if (issent) {
              callback(
                "1",
                { keyword: "rest_keyword_user_verify", content: {} },
                { otp: otp }
              );
            } else {
              callback(
                "0",
                { keyword: "rest_keyword_error_message", content: {} },
                {}
              );
            }
          }
        );
      }
    });
  },

  signup: (request, callback) => {
    Auth.checkEmailused(request, (isUsed) => {
      if (isUsed) {
        callback(
          "0",
          { keyword: "rest_keyword_unique_email", content: {} },
          {}
        );
      } 
      else {
        if (request.login_type == "S") {
          var password;
          console.log(password);
          middleware.encryption(request.password, (response) => {
            password = response;
          });
        } else {
          password = "";
        }

        var userdata = {
          // profile:request.profile != undefined ? request.profile : "default.jpg",
          first_name: request.first_name,
          last_name: request.last_name,
          code: request.code,
          mobile: request.mobile,
          email: request.email,
          email_verify:request.email_verify,
          role:request.role,
          trainer_type_id:request.trainer_type_id,
          per_session_price:request.per_session_price,
          speciality:request.speciality,
          login_type:request.login_type,
          // login_status:request.login_status,
          
          // password:request.password,
          password:
            request.login_time != "F" && request.login_time != "G"
              ? password
              : password,

          
        };

        con.query(`INSERT INTO tbl_user SET ?`, [userdata], (error, result) => {
          console.log("error1", error);
          // console.log("error", error);
          if (!error) {
            var user_id = result.insertId;
            console.log("error", error);

            Auth.getuserdetails(user_id, (userdata) => {
              if (userdata == null) {
                callback(
                  "2",
                  { keyword: "rest_keyword_user_null", content: {} },
                  {}
                );
              } else {
                common.checkUpdateToken(user_id, request, (token) => {
                  if (request.role == 'user') {
                    Auth.getuserdetails(user_id, (userdata) => {
                      userdata.token = token;
                      if (userdata == null) {
                        callback(
                          "2",
                          { keyword: "rest_keyword_user_not_signup", content: {} },
                          {}
                        );
                      } else {
                        callback(
                          "1",
                          { keyword: " User Sign up sucessfully", content: {} },
                          userdata
                        );
                      }
                    });
                  } else {
                    Auth.gettrainerdetails(user_id, (userdata) => {
                      userdata.token = token;
                      if (userdata == null) {
                        callback("2",{ keyword: "rest_keyword_user_trainer_not_signup", content: {} },{});
                      } else {
                        callback("1", { keyword: "rest_keyword_trainer_signup", content: {} }, userdata);
                      }
                    });
                  }
                 
                });
              }
            });
            // console.log("error",error);
          } else {
            callback(
              "0",
              { keyword: "rest_keyword_error_message", content: {} },
              {}
            );
          }
        });
        // console.log(response);
      }
    });
  },
  getuserdetails: (user_id, callback) => {
    con.query(
      `SELECT u.first_name,u.last_name,u.code,u.mobile,u.email,ifnull(di.token,'') as token,ifnull(di.device_type,'') as device_type,ifnull(di.device_token,'') as device_token,u.role,u.login_status,u.login_time,is_forget FROM tbl_user u
        LEFT JOIN tbl_device_info di ON di.user_id = u.id
        WHERE u.id = ? AND u.is_active = 1;`,
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
  gettrainerdetails: (user_id, callback) => {
    con.query(
      `SELECT u.first_name,u.last_name,u.code,u.mobile,u.email,ifnull(di.token,'') as token,ifnull(di.device_type,'') as device_type,ifnull(di.device_token,'') as device_token,u.role,u.per_session_price,u.speciality,u.login_status,u.login_time FROM tbl_user u
        LEFT JOIN tbl_device_info di ON di.user_id = u.id
        WHERE u.id = ? AND u.is_active = 1;`,
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

  completeprofile: (request, callback) => {
    var userdata = {
      profile_image: request.profile_image,
      gender: request.gender,
      dob: request.dob,
      height_type:request.height_type,
      height:request.height,
      weight:request.weight,
      goal:request.goal,
      experience:request.experience
    };

    con.query(
      `UPDATE tbl_user SET ? WHERE id = ?`,
      [userdata, request.user_id],
      (error, result) => {
        console.log(error)
        if (!error) {
          var user_id = request.user_id;
          Auth.getuserdetails(user_id, (userdata) => {
            if (userdata == null) {
              callback(
                "2",
                { keyword: "rest_keyword_user_not_complete_profile", content: {} },
                {}
              );
            } else {
              common.checkUpdateToken(user_id, request, (token) => {
                Auth.getuserdetails(user_id, (userdata) => {
                  userdata.token = token;
                  if (userdata == null) {
                    callback(
                      "2",
                      { keyword: "rest_keyword_user_not_complete_profile", content: {} },
                      {}
                    );
                  } else {
                    callback(
                      "1",
                      { keyword: "rest_keyword_user_complete_profile", content: {} },
                      userdata
                    );
                  }
                });
              });
            }
          });
        } else {
          callback(
            "0",
            { keyword: "rest_keyword_error_message", content: {} },
            {}
          );
        }
      }
    );
  },

  login: (request, callback) => {
    // console.log("error:",request);
    if (request.login_type == "S") {
      con.query(
        `SELECT * FROM tbl_user WHERE email = ?`,
        [request.email],
        (error, result) => {
          // console.log("error:",result);
          if (!error && result.length > 0) {
            var cpassword;
            middleware.encryption(request.password, (response) => {
              cpassword = response;
            });

            if (cpassword == result[0].password) {
              Auth.getuserdetails(result[0].id, (userdata) => {
                if (userdata == null) {
                  callback(
                    "2",
                    { keyword: "rest_keyword_user_null", content: {} },
                    {}
                  );
                } else {
                  var update_status = {
                    login_status: "Online",
                    login_time: new Date(),
                  };

                  con.query(
                    `UPDATE tbl_user SET ? WHERE id = ?`,
                    [update_status, result[0].id],
                    (error, response) => {
                      comman.checkUpdateToken(
                        result[0].id,request,(token) => {
                          userdata.token = token;
                          if (result[0].role =='user') {
                            Auth.getuserdetails(result[0].id, (userdata) => {
                              //  console.log('getdetails:',);
                              callback("1",{keyword: "rest_keyword_user_login",content: {},},userdata );
                            });
                          } else {
                            Auth.gettrainerdetails(result[0].id, (userdata) => {
                              //  console.log('gettrainer:',gettrainerdetails);
                              callback( "1", { keyword: "rest_keyword_trainer_login",content: {}, }, userdata);
                            });
                          }
                         
                        }
                      );
                    }
                  );
                }
              });
            } else {
              callback(
                "0",
                { keyword: "rest_keyword_invalid_password", content: {} },
                {}
              );
            }
          } else {
            callback(
              "0",
              { keyword: "rest_keyword_invalid_email", content: {} },
              {}
            );
          }
        }
      );
    } else {
      con.query(
        `SELECT * FROM tbl_user WHERE social_id = ?`,
        [request.social_id],
        (error, result) => {
          if (!error && result.length > 0) {
            Auth.getuserdetails(result[0].id, (userdata) => {
              if (userdata == null) {
                callback(
                  "2",
                  { keyword: "rest_keyword_user_null", content: {} },
                  {}
                );
              } else {
                var update_status = {
                  login_status: "Online",
                  login_time: new Date(),
                };

                con.query(
                  `UPDATE tbl_user SET ? WHERE id = ?`,
                  [update_status, result[0].id],
                  (error, response) => {
                    comman.checkUpdateToken(result[0].id, request, (token) => {
                      userdata.token = token;
                      Auth.getuserdetails(result[0].id, (userdata) => {
                        callback(
                          "1",
                          { keyword: "rest_keyword_user_login", content: {} },
                          userdata
                        );
                      });
                    });
                  }
                );
              }
            });
          } else {
            callback(
              "0",
              { keyword: "rest_keyword_invalid_email", content: {} },
              {}
            );
          }
        }
      );
    }
  },

  logout: (request, callback) => {
    var update_device = {
      token: "",
      // device_type: "A",
      device_token: "",
    };

    con.query(
      `UPDATE tbl_device_info SET ? WHERE user_id = ?`,
      [update_device, request.user_id],
      (error, result) => {
        console.log("error", error);
        if (!error) {
          if (request.role =='user') {
            Auth.getuserdetails(request.user_id, (userdata) => {
              if (userdata == null) {
                callback(
                  "2",
                  { keyword: "rest_keyword_user_null", content: {} },
                  {}
                );
              } else {
                var updObj = {
                  login_status: "offline",
                };
                con.query(
                  `UPDATE tbl_user SET ? WHERE id = ?`,
                  [updObj, request.user_id],
                  (error, result) => {
                    if (!error) {
                      Auth.getuserdetails(request.user_id, (userdata) => {
                        callback(
                          "2",
                          { keyword: "rest_keyword_user_logout", content: {} },
                          userdata
                        );
                      });
                    } else {
                      callback(
                        "0",
                        { keyword: "rest_keyword_error_message", content: {} },
                        {}
                      );
                    }
                  }
                );
              }
            });
          } else {
            Auth.gettrainerdetails(request.user_id, (userdata) => {
              if (userdata == null) {
                callback(
                  "2",
                  { keyword: "rest_keyword_user_null", content: {} },
                  {}
                );
              } else {
                var updObj = {
                  login_status: "offline",
                };
                con.query(
                  `UPDATE tbl_user SET ? WHERE id = ?`,
                  [updObj, request.user_id],
                  (error, result) => {
                    if (!error) {
                      if (request.role =='user') {
                        Auth.getuserdetails(request.user_id, (userdata) => {
                          callback("1",{ keyword: "rest_keyword_user_logout", content: {} }, userdata );
                        });
                      } 
                      else {
                        Auth.gettrainerdetails(request.user_id, (userdata) => {
                          callback("1",{ keyword: "rest_keyword_trainer_logout", content: {} },userdata);
                        });
                      }
                     
                    } else {
                      callback(
                        "0",
                        { keyword: "rest_keyword_error_message", content: {} },
                        {}
                      );
                    }
                  }
                );
              }
            });
          }
          
        } else {
          callback(
            "0",
            { keyword: "rest_keyword_error_message", content: {} },
            {}
          );
        }
      }
    );
  },

  checkEmailused: (request, callback) => {
    con.query(
      `SELECT * FROM tbl_user WHERE email = ? AND is_active = '1' AND is_delete = '0'`,
      [request.email],
      (error, result) => {
        if (!error && result.length > 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    );
  },

  checkMobileNumberUsed: (request, callback) => {
    con.query(
      `SELECT * FROM tbl_user WHERE mobile = ? AND is_active = '1' AND is_delete = '0'`,
      [request.mobile],
      (error, result) => {
        if (!error && result.length > 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    );
  },

  
  forgotpassword: (request, callback) => {
    if (request.login_type === "S") {
      con.query("SELECT * FROM tbl_user WHERE email = ? AND is_active = 1 AND is_delete = 0", [request.email],(error, result) => {
          if (!error && result.length > 0) {
            var data = result[0];
            emailtemplate.forgotpass(data, (forgotpass) => {
              common.sendmail(
                request.email,
                "Forgot Password",
                forgotpass,
                (isSent) => {
                  if (isSent) {
                    var forgotdata = {
                      is_forget: "1",
                      forget_time: new Date(),
                    };

                    con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[forgotdata, data.id],(error, result) => {
                        // console.log("log", error);
                        if (!error) {
                          if (data.role == 'user') {
                              //  console.log(result.role);
                            Auth.getuserdetails(data.id, (data) => {
                              // console.log(data.id);
                              if (data == null) {
                                callback("2",{ keyword: "rest_keyword_user_null for user", content: {},},{} );
                              } 
                              else 
                              {
                                callback("1",{keyword: "rest_keyword_password_forget for user", content: {},},data);}
                            });
                          } else {
                            Auth.gettrainerdetails(data.id, (data) => {
                              if (data == null) {
                                callback("2",{ keyword: "rest_keyword_user_null for tariner", content: {},},{} );
                              } 
                              else {
                                callback("1",{keyword: "rest_keyword_password_forget for trainer", content: {},},data);}
                            });
                          }
                        } else {
                          callback("0",{keyword: "rest_keyword_password_not_forget", content: {},}, {});}  }
                    );
                  } else {
                    callback("2", { keyword: "rest_keyword_email_not_found", content: {} }, {} );
                  }
                }
              );
            });
          } else {
            callback( "0", { keyword: "rest_keyword_error_message", content: {} },{});
          }
        }
      );
    } else {
      callback("0", { keyword: "user not exist", content: {} }, {});
    }
  },

  resetpassword: (request, id, callback) => {
    var password;
    middleware.encryption(request.password, (response) => {
      password = response;
    });

    updObj = {
      password: password,
    };

    con.query(`UPDATE tbl_user SET ? WHERE id = ?`, [updObj, id],(error, result) => {
        if (!error) {
          Auth.getuserdetails(id, (userdata) => {
            if (userdata == null) {
              callback( "2", { keyword: "rest_keyword_user_null", content: {} }, {});
            } else {
              callback("1", { keyword: "rest_keyword_password_forget", content: {} }, userdata  );}
          });
        } else {
          callback("0",{ keyword: "rest_keyword_error_message", content: {} },  {} );
        }
      }
    );
  },

  // chengepassword

  changepassword: (request, user_id, callback) => {
    var password;
    middleware.encryption(request.new_password, (response) => {
      password = response;
    });

    con.query(
      `UPDATE tbl_user SET password = '${password}' WHERE id = ${user_id}`,
      (error, result) => {
        if (!error ) {
          callback("1", { keyword: "rest_keyword_password_update ", content: {} }, {});
        } else {
          callback("0",{ keyword: "rest_keyword_password_not_update ", content: {} }, error );
        }
      }
    );
  },

  //  my profile update
  personalinfo: (request,user_id, callback) => {
    userdata ={
      id:user_id,
      first_name:request.first_name,
      last_name:request.last_name,
      code:request.code,
      mobile:request.mobile,
      email:request.email,
      // password:request.password,
    }
    console.log("dwdswxsx",userdata);
    con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[userdata,request.id],
    (error, result) => {
      if(!error){

    Auth.getuserdetails(user_id,(userdetails)=>{
      // console.log(userdetails);
         if (userdetails.role == 'user'){
          console.log(userdetails.role)
          callback("1",{keyword:"user  profile updated ",content:{}},userdata)
  
         }
         else{
          callback("1",{keyword:"trainer  profile updated ",content:{}},userdata)
  
         }
    })
     
      }else{
        console.log(error)
        callback("2",{keyword:"not found ",content:{}},{})
      }
     
    }
        
    );
  },

  //  my fitness update 
  myfitness: (request,user_id, callback) => {
    userdata ={
      id:user_id,
      gender:request.gender,
      dob:request.dob,
      height:request.height,
      weight:request.weight,
      experience:request.experience,
      goal:request.goal,
      // password:request.password,
    }
    console.log("dwdswxsx",userdata);
    con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[userdata,request.id],
    (error, result) => {
      console.log("error",error)
      if (!error ) {
          callback("1", { keyword: " fitness data updated", content: {} }, userdata);
        } else {
          callback("0", { keyword: "fitness data my updated", content: {} }, {});
        }
      }
        
    );
  },


  ValidateUser: function (request, callback) {
    Auth.checkMobileNumberUsed(request, (iused) => {
        if (iused) {
            callback(0, { keyword: "phone_number_used_message" }, null)
        }
        else {
            var otp = Auth.generateOTP()
            const accountSid = 'AC2884633ccb5f8679d79992e5c0a1e659'; // Your Account SID from https://www.twilio.com/console
            const authToken = '67015d108a17037097480877bb287a36'; // Your Auth Token from https://www.twilio.com/console

            const client = require('twilio')(accountSid, authToken);
            const message = client.messages.create({
                body: 'Hello,This message is from node js team this is your otp ' + otp + '',
                to: "+91'" + request.mobile + "'",
                from: '+13156442435',
            });
            callback(1, { keyword: "otp_send_success_message" }, { otp: otp })

            // You can implement your fallback code here
        }
    })
},

generateOTP:function() {
          
  // Declare a digits variable 
  // which stores all digits
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
},

sendOtp: (request, callback) => {
  var sql =
    "UPDATE tbl_user WHERE otp = ? AND is_active = 1 AND is_delete = 0";
  con.query(sql, [request.otp], (error, result) => {
    if (!error && result.length > 0) {
      console.log(result);
      callback(
        "1",
        { keywords: "rest_keywords_resend_otp_message", content: {} },
        {}
      );
    } else {
      callback(
        "0",
        {
          keywords: "rest_keywords_resend_otp_not_match_message",
          content: {},
        },
        {}
      );
      console.log("resend otp error", error);
    }
  });
},

//  card 
payment: (request, user_id, callback) => {

  var paymentdetails = {
      user_id: user_id,
      card_number: request.card_number,
      account_holder:request.account_holder,
      card_cvv: request.card_cvv,
      expiry_date: request.expiry_date
  }
  var sql = `insert into tbl_card set ? `
  // console.log(paymentdetails)
  con.query(sql, [paymentdetails], (error, result) => {
      if (!error) {
          Auth.cardetail(result.insertId, (cardetail) => {

              callback('1', { keyword: "rest_keyword_card_details", content: {} }, cardetail)
          })

      } else {
          callback('0', { keyword: "rest_keyword_card_details_not", content: {} }, { error })

      }
  })
},
      // payment carddetails del
      paymentdel: (request, user_id, callback) => {
        var sql = `delete from tbl_card where id = ?`
        con.query(sql, [request.card_id], (error, result) => {
            if (!error) {
                callback('1', { keyword: "rest_keyword_card_details_delete", content: {} }, user_id)
            } else {
                callback('0', { keyword: "rest_keyword_card_details_delete_not", content: {} }, {})
            }
        })
    },


  cardetail: (user_id, callback) => {
    con.query(
      `SELECT card_number,account_holder,card_cvv,expiry_date FROM tbl_card where id=?`,
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

  //  chat 
  chat : (request,user_id,callback) => {

    var chatData = {
        sender_id : request.sender_id,
        receiver_id : request.receiver_id,
        message : request.message
    }
  
    con.query(`INSERT INTO tbl_chats SET ?`,[chatData],(error,result) => {
        console.log(error);
        if (!error) {
            con.query(`SELECT * FROM tbl_chats WHERE id = ?`,[result.insertId],(error,result1)=>{
                if (!error && result1.length > 0) {
                    callback('1',{keyword : 'chat box'},result1)
                } else {
                    callback('2',{keyword : 'chat not found'},{})
                }
            })
        } else {
            callback('0',{keyword : 'something went wrong'},{})
        }
    })
  
  },

chat_display : (request,user_id,callback) => {

    con.query(`SELECT sender_id,receiver_id,message,TIME_FORMAT(created_at,"%h:%i %p") time FROM tbl_chats WHERE (sender_id = ${request.sender_id} AND receiver_id = ${request.receiver_id}) OR (sender_id = ${request.receiver_id} AND receiver_id = ${request.sender_id}) order by created_at ASC`,(error,result) => {
        if (!error && result.length > 0) {
            callback('1' , {keyword : "chat display"},result);
        } else {
            callback('0' , {keyword : "Chat not dislay"},{});
            
        }
    })
},

// filter
Filter: function (request, callback) {
  con.query("select * from tbl_user where id = ? ", [request.user_id], function (err, result) {

      if (!err) {
          var SessionTime = ""
          if (request.from_time != undefined && request.to_time != "") {
              SessionTime += `AND (tb.from_time != '${request.from_time}' AND  tb.to_time != '${request.to_time}')`
          } else {
              SessionTime = ""
          }
          var TrainerType = ""
          if (request.trainer_type != undefined && request.trainer_type != "") {
              TrainerType += `AND u.trainer_type = '${request.trainer_type}'`
          } else {
              TrainerType = ""
          }
          var Distance = ""
          if (request.to_distance != undefined && request.to_distance != "") {
              Distance += `km_away BETWEEN '${result[0].location}' and ${request.to_distance} `
          }
          var PriceBetween = ""
          if (request.price_from != undefined && request.price_from != "" && request.price_to != undefined && request.price_to != "") {
              PriceBetween += `AND td.per_session_price BETWEEN ${request.price_from} AND ${request.price_to}`
          } else {
              PriceBetween = ``
          }
          var sql = `Select concat(u.first_name , ' ' , u.last_name) as name, u.profile_image, u.mobile,u.email,u.speciality,u.rating,u.location,u.per_session_price, ROUND( ( 6371  ACOS( COS(RADIANS(${result[0].latitude}))  COS(RADIANS(u.latitude))  COS( RADIANS(u.longitude) - RADIANS(${result[0].longitude}) ) + SIN(RADIANS(u.latitude))  SIN(RADIANS(${result[0].latitude})) ) ) ) AS km_away from tbl_user as u join tbl_booking as b  on b.id=u.id 
          join tbl_trainer_availability tb on u.id = tb.id
          where u.is_active = 1 and u.is_delete = 0 ${TrainerType} ${SessionTime} having ${Distance} ${PriceBetween}`;
          con.query(sql, (error, result1) => {
              if (!error && result1.length > 0) {
                  callback(result1)
              } else {
                  callback(err)
              }
          })
      }
      else {
          callback('2', { keyword: "rest_keyword_trainer_not_avalable", content: {} }, err)
      }
  })
},


};
module.exports = Auth;
