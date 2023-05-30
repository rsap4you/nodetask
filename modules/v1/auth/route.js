const con = require('../../../config/database')
const express = require('express');
const router = express.Router();
const middleware = require('../../../middleware/validator');
const Auth = require('./modal');
const { request } = require('express');
var multer = require('multer');
var path = require('path');
const { error } = require('console');
const { required } = require('../../../language/en');

var storage1 = multer.diskStorage({
    destination:function(request,file,callback){
      callback(null,'public/user')
    },
    filename:function(request,file,callback){
      callback(null,Date.now()+ path.extname(file.originalname));
  
    }
  });
  
  var upload = multer({
    storage:storage1,
    limits:{
      filesize: (12 * 1024 * 1024)
    }
  }).single('profile_image');
  
  
  
  router.post("/uploadprofile",function(request,res){
    upload(request,res,function(error){
      if(error){
         middleware.sendResponse(request,res,'0',{keyword:"something went wrong ! failed to upload",content:{}},null);
      }
     else{
      middleware.sendResponse(request,res,'1',{keyword:"upload success",content:{}},{image:request.file.filename});
     } 
  
    })
  });


// mutiple pic upload
var storage = multer.diskStorage({
    destination:function(request,file,callback){
      callback(null,'public/place')
    },
    filename:function(request,file,callback){
      callback(null,Date.now()+ path.extname(file.originalname));
  
    }
  });
  

  
  var placeimage = multer({
    storage:storage,
    limits:{
      filesize: (12 * 1024 * 1024)
    }
  }).array('image',3)




  router.post("/uploadproduct",function(request,res){
    // middleware.decryption(req.body,(request)=>{
    placeimage(request,res,function(error,result,message){
        // console.log("error",error);
      if(error){
        console.log(error)
        middleware.sendResponse(request,res,'0',{keyword :"rest_keywords_upload_img_error",content:{}},null);
      }
     else{
        // console.log(result)
       middleware.sendResponse(request,res,'1',{keyword :"rest_keyword_user_add",content:{}},result);
     } 
  
    })

  });
  
// **** end  multer code *******
router.post('/signup', (req, res) => {

    var request = req.body;
    //  middleware.decryption(req.body,(request)=>{
    var rules = {

       
        profile: '',
        first_name: 'required',
        last_name: 'required',
        code:'required',
        mobile:'required',
        email: ['required', 'email'],
        email_verify:'required',
        password: 'required_if:login_type,S',
        role:'required|in:user,trainer',
        trainer_type:'required_if:role,==,trainer',
        per_session_price:'required_if:role,==,trainer',
        speciality:'required_if:role,==,trainer',
        
        login_type : 'required|in:S,F,G',
        device_type: 'required|in:A,I,W',   
        device_token: 'required',
    }

  

    var message = {
        required: req.language.required,
        email: req.language.email
    }

    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.signup(request, (code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }

    //  })
 })

router.post('/completeprofile', (req, res) => {

    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var rules = {
        user_id : 'required',
        profile_image: 'required',
        gender: 'required',
        dob: 'required',
        height_type: 'required',
        height: 'required',
        // weight_type:'required',
        weight:'required',
        goal:'required',
        experinece:'required' 
    }

    var message = {
        required: req.language.required,
        // email: req.language.email
    }

    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.completeprofile(request, (code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }

    //  })

})

router.post('/verify-otp',(req,res)=>{

    var request = req.body;

    var rules = {
        user_id:'required',
        otp_code:'required'
    }

    var message = {
        required: ':attr fild is requiered'
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.verification(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 

})

router.post('/resend',(req,res)=>{
    var request = req.body;

    var rules = {
        user_id:'required'
    }

    var message = {
        required: ':attr fild is requiered'
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.resend(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
})

router.post('/mobileotp',(req,res)=>{
  var request = req.body;

  var rules = {
      mobile:'required|numeric'
  }

  var message = {
      required: ':attr fild is requiered'
  }

  if (middleware.checkValidation(res,request,rules,message)) {
      Auth.ValidateUser(request,(code,message,data) => {
          middleware.sendResponse(req, res, code, message ,data)
      })
  } 
})

router.post('/login', (req, res) => {

    // middleware.decryption(req.body,(request)=>{

    var request = req.body;

    var rules = {
        login_type : 'required|in:S,F,G',
        email: 'required_if:login_type,S',
        password: 'required_if:login_type,S',
        social_id : 'required_if:login_type,F,G',
        device_type: 'required',
        // device_token: 'required'
    }

    var message = {
        required: req.language.required,
        email: req.language.email
    }

    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.login(request, (code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }
  //  })

})

router.post('/logout', (req, res) => {
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var rules = {
        user_id: 'required'
    }

    var message = {
        required: req.language.required,
    }


    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.logout(request, (code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }
    // })
})

router.get('/forgot/:id', (req, res) => {
    var id = req.params.id;
    console.log('id:',id);
    con.query(`SELECT * FROM tbl_user WHERE id = ?`, [id], (error, result) => {
      var currtime = new Date();
      // var timediff = 1
      //  var test = currtime.getMinutes()
      var timediff = (currtime.getMinutes() - result[0].forget_time.getMinutes());
      // console.log(currtime);
        // console.log("timediff", timediff);
        // console.log("time", result[0].forget_time.getMinutes());

        // console.log(result)
        if (!error && result.length > 0) {
            var data = result[0];
            var is_forget = data.is_forget;
            if (is_forget == 1 && timediff < 2) {
                res.render('forgot.html', { id: req.params.id })
            } else {
                con.query(`UPDATE tbl_user SET is_forget = '0'`, (error, result) => {
                    res.send("Invalid link")
                })
            }
        } else {
            res.send("Invalid link")

        }
    })


})

router.post('/forgoted/:id', (req, res) => {
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var id = req.params.id
    Auth.getuserdetails(id, (userdata) => {
        if (userdata == null) {
            middleware.sendResponse(req, res, code, massage, data);
        } else {
            if (userdata.is_forget == 1) {
                Auth.resetpassword(request, id, (code, massage, data) => {
                    con.query(`UPDATE tbl_user SET is_forget = '0'`, (error, result) => {
                      // console.log("error to upadte",error);
                        res.render("result.html", { data: data })
                    })
                });
            } else {
              // console.log("error in resut.htnl:",error);
                res.send("Invalid!!")
            }
        }

    })
    // }) 

})

router.post('/forgotpassword', (req, res) => {
    // middleware.decryption(req.body,(request)=>{
    var request = req.body;

    var rules = {
        login_type : "required",
        email: 'required_if:login_type,S',
    }

    var massage = {
        required: req.language.required,
        email: req.language.email
    }

    if (middleware.checkValidation(res, request, rules, massage)) {
        Auth.forgotpassword(request, (code, massage, data) => {
            middleware.sendResponse(req, res, code, massage, data);
        });
    }
    // })
})

router.patch('/changepswd', (req, res) => {

    // middleware.decryption(req.body, (request) => {
        var request = req.body;
        var user_id = req.user_id;

        var rules = {
            old_password : "required",
            new_password: 'required',
        }
    
        var massage = {
            required: req.language.required,
           
        }
    
        if (middleware.checkValidation(res, request, rules, massage)) {
            Auth.changepassword(request, user_id, (code, massage, data) => {
                middleware.sendResponse(req, res, code, massage, data);
            });
        }
       
    // });

});
//  profile info
router.patch('/personalinfo',(req,res)=>{
  // middleware.decryption(req.body,(request)=>{
     var request = req.body;
     var user_id = req.user_id
      var rules ={

          first_name:"required",
          last_name:"required",
          code:'required',
          mobile:"required|numeric",
          email:"required|email",
          // location:"required"    
      }
       
      var message ={ 
          required:req.language.required,
      }
      if (middleware.checkValidation(res, request,rules)) {
          Auth.personalinfo(request,user_id, (code, massage, data) => {
              middleware.sendResponse(req, res, code, massage, data);
          });
      }
  // })
})   

//  my filteness information
router.patch('/myfitness',(req,res)=>{
  // middleware.decryption(req.body,(request)=>{
     var request = req.body;
     var user_id = req.user_id
      var rules ={

          id:"required",
          gender:"required",
          dob:"required",
          height:'required',
          weight:"required",
          experinece:"required",
          goal:"required"    
      }
       
      var message ={ 
          required:req.language.required,
      }
      if (middleware.checkValidation(res, request,rules)) {
          Auth.myfitness(request,user_id, (code, massage, data) => {
              middleware.sendResponse(req, res, code, massage, data);
          });
      }
  // })
})   


router.post("/cardadd", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    // var user_id = req.user_id
    var rules = {
      card_number: "required",
      account_holder:"required",
      card_cvv: "required",
      expiry_date: "required",
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Auth.payment(request, req.user_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

router.post("/delcard", (req, res) => {
  middleware.decryption(req.body, (request) => {
    // var request = req.body
    // var user_id = req.user_id
    var rules = {
      card_id: "required",
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.paymentdel(request, req.user_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  });
});

router.post("/chat", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body;
    var user_id = req.user_id;

    var rules = {
      sender_id: "required",
      receiver_id: "required",
      message: "required",
    };

    var message = {
      required: req.language.required,
    };

    if (middleware.checkValidation(res, request, rules, message)) {
      Auth.chat(request, user_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

router.get("/chat_display", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body;
    var user_id = req.user_id;

    var rules = {
        sender_id: "required",
        receiver_id: "required",
    };

    var message = {
      required: req.language.required,
    };

    if (middleware.checkValidation(res, request, rules, message)) {
      Auth.chat_display(request, user_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

module.exports = router;