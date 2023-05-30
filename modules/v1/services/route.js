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
    var trainer_id = req.trainer_id
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

router.post("/homepage", (req, res) => {
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
      Service.homepage(request,user_id,page,limit,(code, message, data) => {
        middleware.sendResponse(req, res, code, message, data);
      });
    }
  // });
}); 


module.exports = router;
