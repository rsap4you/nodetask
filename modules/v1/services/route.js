const con = require("../../../config/database");
const express = require("express");
const router = express.Router();
const middleware = require("../../../middleware/validator");
const Auth = require("../auth/modal");
const Service = require("../services/model");

router.post("/review", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    var trainer_id = req.trainer_id
    var rules = {
      trainer_id:"required",
      rating:"required",
      review:"required"
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.review(request, req.trainer_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

router.post("/myreviews", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    // var trainer_id = req.trainer_id
    var page = req.query.page;
    var limit = req.query.limit;
    var rules = {
     user_id:'required'
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.myreviews(request,page,limit,(code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

// block trainer

router.post("/blocktariner", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    var trainer_id = req.user_id
    var rules = {
      trainer_id:"required",
      user_id:"required",
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.blocktariner(request, req.trainer_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

router.post("/blocktarinerdetails", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    var user_id = req.user_id
    var rules = {
      // trainer_id:"required",
      // user_id:"required",
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.blocktarinerdetails(request, user_id,(code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

//  unblock trainer
router.post("/unblocktariner", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    var trainer_id = req.trainer_id
    var rules = {
      trainer_id:"required",
      user_id:"required",
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.unblocktariner(request, trainer_id, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

// search
router.post("/search", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    // var trainer_id = req.trainer_id
    var rules = {
      // search:'required'
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.searchdetails(request, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

//  trainer profile
router.post("/trainerprofile", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    var trainer_id = req.trainer_id
    var rules = {
      // search:'required'
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.trainerprofile(request,(code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

router.post("/mapview", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body
    var user_id = req.user_id
    var rules = {
      // search:'required'
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.mapview(request, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

// homepage

router.get("/homepage", (req, res) => {
  // middleware.decryption(req.body, (request) => {
   
    var request = req.body
    var user_id = req.user_id

    var page = req.query.page;
    var limit = req.query.limit;
    
    var rules = {
      // search:'required'
    };
    var message = {
      required: "please enter :attr",
    };
    if (middleware.checkValidation(res, request, rules, message)) {
      Service.homepage(request,user_id,page,limit,(code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
}); 

router.get("/filter", (req, res) => {
  // middleware.decryption(req.body, (request) => {
    var request = req.body;
    var user_id = req.user_id;

    var rules = {
        // sender_id: "required",
        // receiver_id: "required",
    };

    var message = {
      required: req.language.required,
    };

    if (middleware.checkValidation(res, request, rules, message)) {
      Service.Filter(request, (code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
});

// book trainer
router.post('/booktrainer',(req,res)=>{
  var request = req.body;
  var rules = {
      trainer_id : "required",
      book_date : "required",
      // location_type:"required",
      // address_1:"required",
      // address_2:"required",
      // zip_code:"required",
      book_slot : "",
      payment_type : "required_with:location_id",
      card_id : "required_with:payment_type"
  }

  var message = {
      required: req.language.required,
  }

  //  middleware.decryption(req.body,(request)=>{
      var user_id = req.user_id;
      if (middleware.checkValidation(res,request,rules,message)) {
          Service.booktrainer(request,user_id,(code,message,data) => {
              middleware.sendResponse(req, res, code, message ,data)
          })
      } 

 })
// ruuning booking 
router.post('/runningbooking',(req,res)=>{
  var request = req.body;
  var rules = {
      // trainer_id : "required",
      
  }

  var message = {
      required: req.language.required,
  }

  //  middleware.decryption(req.body,(request)=>{
      var user_id = req.user_id;
      if (middleware.checkValidation(res,request,rules,message)) {
          Service.runningbooking(request,user_id,(code,message,data) => {
              middleware.sendResponse(req, res, code, message ,data)
          })
      } 

 })

//  accepted booking
router.post('/acceptedbooking',(req,res)=>{
  var request = req.body;
  var trainer_id =req.user_id;
  var rules = {
      order_id : "required",
      
  }

  var message = {
      required: req.language.required,
  }

  //  middleware.decryption(req.body,(request)=>{
      var user_id = req.user_id;
      if (middleware.checkValidation(res,request,rules,message)) {
          Service.acceptedbooking(request,trainer_id,(code,message,data) => {
              middleware.sendResponse(req, res, code, message ,data)
          })
      } 

 })

 //  cancel booking
router.post('/cancelbooking',(req,res)=>{
  var request = req.body;
  var trainer_id =req.user_id;
  var rules = {
      order_id : "required",
      
  }

  var message = {
      required: req.language.required,
  }

  //  middleware.decryption(req.body,(request)=>{
      var user_id = req.user_id;
      if (middleware.checkValidation(res,request,rules,message)) {
          Service.cancelbooking(request,trainer_id,(code,message,data) => {
              middleware.sendResponse(req, res, code, message ,data)
          })
      } 

 })
//   my booking
//  accepted booking
router.post('/mybooking',(req,res)=>{
  var request = req.body;
  var trainer_id =req.user_id;
  var rules = {
      // order_id : "required",
      
  }

  var message = {
      required: req.language.required,
  }

  //  middleware.decryption(req.body,(request)=>{
      if (middleware.checkValidation(res,request,rules,message)) {
          Service.myBooking(request,trainer_id,(code,message,data) => {
              middleware.sendResponse(req, res, code, message ,data)
          })
      } 

 })


 //add notification
router.post('/addnotification', (req, res) => {
  var request = req.body
  request.user_id = req.user_id
  var rules = {
      message: 'required',
  }
  var message = {
      required: 'please enter :attr'
  }
  if (middleware.checkValidation(res, request, rules, message)) {
      Service.addnotification(request, (code, message, data) => {
          middleware.sendResponse(req, res, code, message, data)
      })
  }
})
//notification
router.get('/notification', (req, res) => {
  var request = req.body
  request.user_id = req.user_id
  Service.notification(request, (code, message, data) => {
      middleware.sendResponse(req, res, code, message, data)
  })
})

module.exports = router;
