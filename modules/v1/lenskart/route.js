const con = require('../../../config/database')
const express = require('express');
const router = express.Router();
const middleware = require('../../../middleware/validator');
const Auth = require('./modal');

router.post('/addplace',(req,res)=>{
    
    //  var request = req.body;
  middleware.decryption(req.body,(request)=>{
    var rules = {
        user_id:'required',
        place_name: 'required',
        about: '',
        location:'required',
        latitude:'required',
        longitude:'required',
        image: ''
    }

    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.addplace(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
   })
})

router.post('/findplace',(req,res)=>{
    
    //  var request = req.body;
  middleware.decryption(req.body,(request)=>{
    var rules = {
        user_id:'required',
        search:''
    }

    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.findplace(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
   })
})

router.get('/getproducts',(req,res)=>{
    middleware.decryption(req.body,(request)=>{
    //  var request = req.body;
     var rules = {
        category_id:'required',
    }

    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        var param = req.query;
        Auth.getproducts(request,param,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
    })
})

router.get('/getproduct',(req,res)=>{
    middleware.decryption(req.body,(request)=>{
        // var request = req.body;
        var rules = {
            product_id : 'required'
        }
    
        var message = {
            required: req.language.required,
        }
    
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.getproduct(request,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
    })
})

router.get('/allproduct',(req,res)=>{
    //middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var rules = {
            product_id : 'required'
        }
    
        var message = {
            required: req.language.required,
        }
    
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.allproduct(request,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   // })
})

router.post('/getcategories',(req,res)=>{
    //  var request = req.body;
    middleware.decryption(req.body,(request)=>{
    var rules = {
        category_id : 'required',
    }
// console.log("sdasfcadf",req);
    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.getcategories(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
})
})

router.post('/addrestaurant',(req,res)=>{
    middleware.decryption(req.body,(request)=>{
    // var request = req.body;
    
    var rules = {
        profile : '',
        cover_image:'',
        name:'required',
        description:'',
        email:'',
        phone:'',
        location:'required',
        latitude:'required',
        longitude:'required',
        status:'required|in:Open,Close',
        open_time:'',
        close_time:''

    }

    var message = {
        required: req.language.required,
        email: req.language.email,
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.addrestaurant(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
})
})



router.get('/restaurant',(req,res)=>{
    // var request = req.body;
    middleware.decryption(req.body,(request)=>{
    var page = req.query.page;
    var limit = req.query.limit;
        Auth.singlerestaurant(request,page,limit,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    })
})

router.post('/searchproduct',(req,res)=>{
     var request = req.body;
 middleware.decryption(req.body,(request)=>{
    var rules = {
        search_keyword:'required',
    }

    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.searchproduct(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
})
})


module.exports = router;