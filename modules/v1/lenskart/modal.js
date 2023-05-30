const { request, response } = require('express');
var asyncLoop = require('node-async-loop');
const common = require('../../../config/common');
const globals = require('../../../config/constant');

con = require('../../../config/database');

var Auth = {

    addplace : (request,callback) => {

        var itemObj = {
            user_id:request.user_id,
            place_name: request.place_name,
            about: (request.about != undefined) ? request.about : '',
            location:request.location,
            latitude:request.latitude,
            longitude:request.longitude
        }

        con.query(`INSERT INTO tbl_place SET ?`,[itemObj],(error,result)=>{
            if (!error) {
                var place_id = result.insertId;
                asyncLoop(request.image,(item,next)=>{
                    var image = {
                        place_id : place_id,
                        image : item,
                    }
                    con.query("INSERT INTO tbl_place_images SET ?",[image],(error,result)=>{
                        if (!error) {
                            next()
                        } else {
                            next()
                        }
                    })
                },()=>{
                    Auth.getitemdetails(place_id,(placedata)=>{
                        // console.log("hello ",result);
                        if (placedata == null) {
                            callback('2',{keyword:'rest_keyword_item_null',content:{}},{})
                        } else {
                            callback('1',{keyword:'rest_keyword_item_add',content:{}},placedata)
                            console.log("asdsa",placedata);
                        }
                    })
                })

            } else {
                callback('0',{keyword:'rest_keyword_data_null',content:{}},{})
            }
        })
    },

    findplace : (request,callback) =>{
        con.query(`SELECT * FROM tbl_user WHERE id = ?`,[request.user_id],(error,result)=>{
            if (!error && result.length > 0) {
                // console.log("lojhjj:",result)
                con.query(`SELECT *,
                concat(round(6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(latitude) - ABS(${result[0].latitude})) * PI()/180 / 2), 2) + COS(ABS(latitude) * PI()/180) * COS(ABS(${result[0].latitude}) * PI()/180) * POWER(SIN((ABS(longitude) - ABS(${result[0].longitude})) * PI()/180 / 2), 2))), 2),' km') AS distance_km,
                concat(ROUND((6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(latitude) - ABS(${result[0].latitude})) * PI()/180 / 2), 2) + COS(ABS(latitude) * PI()/180) * COS(ABS(${result[0].latitude}) * PI()/180) * POWER(SIN((ABS(longitude) - ABS(${result[0].longitude})) * PI()/180 / 2), 2)))) / 40 * 60, 0),' minute') as expected_time_minutes
                FROM tbl_place
                WHERE place_name LIKE "%${request.search}%"
                ORDER BY distance_km ASC;`,(err,response)=>{
                    console.log("lojhjj:",err)
                    if (!err && response.length > 0) {
                        callback('1',{keyword:'places get',content:{}},response)
                    } else {
                        callback('2',{keyword:'places1 not found',content:{}},{})
                    }
                })
            } else {
                callback('2',{keyword:'places not found',content:{}},{})
            }
        })
    },

    getproducts : (request,param,callback)=>{

        con.query(`SELECT * FROM tbl_sub_category WHERE id = ?`,[request.category_id],(error,result)=>{
            if (!error && result.length > 0) {
                var data = result[0]
                // console.log("dtaa",data);
                con.query(`SELECT * FROM tbl_product WHERE sub_category_id = ?`,[data.id],(err,response)=>{
                    // console.log("res",response);
                    if (!err && response.length > 0) {
                        data.products = response
                        asyncLoop(data.products,(item,next)=>{
                            con.query(`SELECT * FROM tbl_product_image WHERE product_id = ?`,[item.id],(error1,result1)=>{
                                if (!error1 && result1.length > 0) {
                                    item.images = result1
                                    next()
                                } else {
                                    item.images = []
                                    next()
                                }
                            })

                        },()=>{
                         callback('1',{keyword:'rest_keyword_data_null',content:{}},data)
                        })
                    } else {
                        callback('0',{keyword:'rest_keyword_data_null',content:{}},{})
                    }
                 })
            } else {
                
            }
        })

        // Auth.getcategories(request,(code,message,categorydata)=>{
        //     if (categorydata == null) {
        //         callback('0',{keyword:'rest_keyword_data_null',content:{}},{})
        //     } else {
        //         var data = categorydata[0].sub_category
        //         con.query(`SELECT * FROM tbl_product WHERE sub_category_id = ?`,[],(error,result)=>{
        //             if (!error && result.length > 0) {
        //                 data.products = result
        //             } else {
                        
        //             }
        //         })



                
        //         //  console.log("data",data.id);
        //         // asyncLoop(data,(item,next)=>{
        //         //     con.query(`SELECT p.id,p.color_id, sc.id as category_id,p.name,(SELECT mc.category_name FROM tbl_main_catagory mc WHERE mc.id = p.main_category_id) as main_category,sc.sub_category_name as sub_category,p.price,CASE
        //         //     WHEN p.discount_type = "Flat" THEN round((p.price - p.discount_value),2)
        //         //     WHEN p.discount_type = "Percentage" THEN round((p.price - (p.price*p.discount_value)/100),2)
        //         //     END as final_amt,p.frame_width,p.frame_size,p.description,ifnull((SELECT round(AVG(rr.rating),1) FROM tbl_product_rating_review rr 
        //         //     WHERE p.id = rr.product_id),"0") as rating
        //         //     FROM tbl_product p
        //         //     JOIN tbl_sub_category sc ON sc.id = p.sub_category_id
        //         //     HAVING sc.id = ?`,[item.id],(error,result)=>{
        //         //         if (!error && result.length > 0) {
        //         //             item.products = result
        //         //             // console.log("data",data);
        //         //             next()
        //         //         } else {
        //         //             item.products = []
        //         //             next()
        //         //         }
        //         //     })
        //         // },()=>{
        //         //     callback('1',{keyword:'rest_keyword_data_null',content:{}},data)
        //         // })
        //     }
        // })

        // con.query(`SELECT * FROM tbl_main_catagory WHERE id = ?`,[request.category_id],(error,result)=>{
        //   var data = result[0]
        //     if (!error && result.length > 0) {
        //         data.main_category = result
        //         asyncLoop(result,(item,next)=>{
        //         con.query(`SELECT p.id, sc.id as category_id,p.name,(SELECT mc.category_name FROM tbl_main_catagory mc WHERE mc.id = p.main_category_id) as main_category,sc.sub_category_name as sub_category,p.price,CASE
        //         WHEN p.discount_type = "Flat" THEN round((p.price - p.discount_value),2)
        //         WHEN p.discount_type = "Percentage" THEN round((p.price - p.price*p.discount_value/100),2)
        //         END as final_amt,p.frame_width,p.frame_size,p.description,ifnull((SELECT round(AVG(rr.rating),1) FROM tbl_product_rating_review rr 
        //         WHERE p.id = rr.product_id),"0") as rating
        //         FROM tbl_product p
        //         JOIN tbl_sub_category sc ON sc.id = p.sub_category_id`,(error,result)=>{

        //     if (!error && result.length > 0) {
        //         // var itemdata = result;

        //         asyncLoop(result,(item,next)=>{
        //             con.query(`SELECT * FROM tbl_product_image WHERE product_id = ? ORDER BY id DESC LIMIT 1`,[item.id],(err,response)=>{
                        
        //                 if (!err && response.length > 0) {
        //                     item.images = response
        //                      next()
        //                 } else {
        //                     next()
        //                 }
        //             })

        //         },()=>{
        //             callback('1',{keyword:'rest_keyword_item_get',content:{}},result)
        //          })
        //     } else {
        //         callback('0',{keyword:'rest_keyword_data_null',content:{}},{})
        //     }
        //     })
                     
        //         },()=>{
        //             //success callback
        //         })
        //     } else {
                
        //     }

        // })

        
    },

    //get product count category vise

    //SELECT concat(COUNT(p.id)," Products") as category_vise_product FROM tbl_product p WHERE p.sub_category_id = 3;

    //

    getproduct : (request,callback)=>{

        con.query(`SELECT p.id,p.color_id,pc.color, sc.id as category_id,p.name,(SELECT mc.category_name FROM tbl_main_catagory mc WHERE mc.id = p.main_category_id) as main_category,sc.sub_category_name as sub_category,p.price,CASE
        WHEN p.discount_type = "Flat" THEN round((p.price - p.discount_value),2)
        WHEN p.discount_type = "Percentage" THEN round((p.price - p.price*p.discount_value/100),2)
        END as final_amt,p.frame_width,p.frame_size,p.description,ifnull((SELECT round(AVG(rr.rating),1) FROM tbl_product_rating_review rr 
        WHERE p.id = rr.product_id),"0") as rating
        FROM tbl_product p
        JOIN tbl_product_color pc ON pc.id = p.color_id
        JOIN tbl_sub_category sc ON sc.id = p.sub_category_id
        HAVING p.id = ?`,[request.product_id],(error,result)=>{
            if (!error && result.length > 0) {
                // var itemdata = result;
                asyncLoop(result,(item,next)=>{
                    con.query(`SELECT * FROM tbl_product_image WHERE product_id = ?`,[item.id],(err,response)=>{

                        if (!err && response.length > 0) {
                            item.images = response
                             next()
                        } else {
                            next()
                        }
                    })

                },()=>{
                    callback('1',{keyword:'rest_keyword_item_get',content:{}},result)
                 })
            } else {
                callback('0',{keyword:'rest_keyword_data_null',content:{}},{})
            }
        })
    },

    allproduct : (request,callback)=>{

        con.query(`SELECT p.id,p.color_id,pc.color, sc.id as category_id,p.name,(SELECT mc.category_name FROM tbl_main_catagory mc WHERE mc.id = p.main_category_id) as main_category,sc.sub_category_name as sub_category,p.price,CASE
        WHEN p.discount_type = "Flat" THEN round((p.price - p.discount_value),2)
        WHEN p.discount_type = "Percentage" THEN round((p.price - p.price*p.discount_value/100),2)
        END as final_amt,p.frame_width,p.frame_size,p.description,ifnull((SELECT round(AVG(rr.rating),1) FROM tbl_product_rating_review rr 
        WHERE p.id = rr.product_id),"0") as rating
        FROM tbl_product p
        JOIN tbl_product_color pc ON pc.id = p.color_id
        JOIN tbl_sub_category sc ON sc.id = p.sub_category_id
        HAVING p.id = ?`,[request.product_id],(error,result)=>{
            if (!error && result.length > 0) {
                // var itemdata = result;
                asyncLoop(result,(item,next)=>{
                    con.query(`SELECT * FROM tbl_product_image WHERE product_id = ?`,[item.id],(err,response)=>{

                        if (!err && response.length > 0) {
                            item.images = response
                             next()
                        } else {
                            next()
                        }
                    })

                },()=>{
                    callback('1',{keyword:'rest_keyword_item_get',content:{}},result)
                 })
            } else {
                callback('0',{keyword:'rest_keyword_data_null',content:{}},{})
            }
        })
    },

    getcategories : (request,callback) =>{
        con.query(`SELECT * FROM tbl_main_catagory WHERE id = ?`,[request.category_id],(error,result)=>{
            if (!error && result.length > 0) {
                asyncLoop(result,(item,next)=>{
                    con.query(`SELECT sc.id ,CONCAT('${globals.BASE_URL}','${globals.restaurant}',sc.image) as image,sc.sub_category_name,sc.is_active,sc.is_delete,sc.created_at,sc.updated_at FROM tbl_sub_category sc WHERE sc.main_category_id = 1 AND sc.is_active = 1 AND sc.is_delete = 0;`,[request.category_id],(err,response)=>{
                        if (!err && response.length > 0) {
                            item.sub_category = response
                            next()
                        } else {
                            item.sub_category = []
                            next()
                        }
                    }) 
                    
                },()=>{
                     callback('1',{keyword:'rest_keyword_restaurant_get',content:{}},result)
                })
            } else {
                callback('0',{keyword:'rest_keyword_data_null',content:{}},{})  
            }
        })

        
 

    },

    addrestaurant : (request,callback) => {

        var itemObj = {
            profile : (request.profile != undefined) ? request.profile : 'default.jpg',
            cover_image:(request.cover_image != undefined) ? request.cover_image : 'default.jpg',
            name:request.name,
            description:(request.description != undefined) ? request.description : '',
            email:(request.email != undefined) ? request.email : '',
            phone:(request.phone != undefined) ? request.phone : '',
            location:request.location,
            latitude:request.latitude,
            longitude:request.longitude,
            status:(request.status != undefined) ? request.status : ''
        }

        con.query(`INSERT INTO tbl_restaurant SET ?`,[itemObj],(error,result)=>{
            console.log("sadasdf",result);
            var item_id = result.insertId;
            if (!error) {
                Auth.getrestaurantdetails(item_id,(itemdata)=>{
                    if (itemdata == null) {
                        callback('2',{keyword:'rest_keyword_item_null',content:{}},{});
                    } else {
                        callback('1',{keyword:'rest_keyword_restaurant_add',content:{}},itemdata);
                    }
                })
            } else {
                callback('0',{keyword:'rest_keyword_data_null',content:{}},{}) 
            }
        })
    },

    singlerestaurant : (request,page,limit,callback) =>{
        
con.query(`SELECT * FROM tbl_restaurant WHERE is_active = '1' AND is_delete = '0' LIMIT ?,? `,[parseInt(page), parseInt(limit)],(error,result)=>{
            console.log("sdasdas",error);
            if (!error && result.length > 0) {
                callback('1',{keyword:'restaurant get',content:{}},result);
            } else {
                callback('0',{keyword:'restaurant not get',content:{}},{});
            }
        })
    },

    searchproduct : (request,callback) => {
        con.query(`SELECT * FROM tbl_product p 
        JOIN tbl_sub_category sc ON p.sub_category_id = sc.id
        JOIN tbl_main_catagory mc on p.main_category_id = mc.id
        WHERE concat(p.name,'',sc.sub_category_name,'',mc.category_name) LIKE "%${request.search_keyword}%"`,(error,result)=>{

            if (!error && result.length > 0) {
                callback('1',{keyword:'rest_keyword_search_food',content:{}},result)
            } else {
                callback('0',{keyword:'rest_keyword_search_food_null',content:{}},{})
            }
        })
    },

    getitemdetails : (place_id,callback)=>{
        con.query(`SELECT * FROM tbl_place WHERE id = ? AND is_active = "1" AND is_delete = "0";`,[place_id],(error,result)=>{
            // var itemdata = result;
            if (!error && result.length > 0) {
                asyncLoop(result,(item,next)=>{
                    con.query(`SELECT * FROM tbl_place_images WHERE place_id = ?`,[item.id],(err,response)=>{
                        console.log("plave",err);
                        if (!err && response.length > 0) {
                            item.images = response
                            next()
                        } else {
                            item.images = []
                            next()
                        }
                    })
                    
                },()=>{
                    callback(result);
                    console.log("rtesad",result);
                })
            } else {
                    callback(result);
            }
        })
    },

    getrestaurantdetails : (item_id,callback)=>{
        con.query(`SELECT r.id,CONCAT('${globals.BASE_URL}','${globals.restaurant}',r.profile) as profile,r.name,r.description,r.email,r.phone,r.location,r.latitude,r.longitude,r.status,TIME_FORMAT(r.open_time,'%h:%i %p') as open_time,TIME_FORMAT(r.close_time,'%h:%i %p') as close_time,AVG(rr.rating) as rating,COUNT(rr.review) as reviews FROM tbl_restaurant r
        JOIN tbl_rating_review rr ON rr.restaurant_id = r.id
        WHERE r.id = ? AND r.is_active = 1 AND r.is_delete = 0;`,[item_id],(error,result)=>{
            console.log("adsddsd",error);
            var itemdata = result;
            if (!error && result.length > 0) {
                callback(itemdata);
            } else {
                callback(itemdata);
            }
        })
    }
}

module.exports = Auth;