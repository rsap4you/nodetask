var massages = {
  //required messages
  "required" : "You forgot the :attr field",
  "email": "email is not valid",
  "rest_keyword_required_massage": "You forgot the :attr field",
//unique value messages
  "rest_keyword_unique_email": "Hey {username}! This email is already being used.",
  "rest_keyword_unique_mobile": "Hey {username}! This mobile is already being used.",
// something went wrong 
"rest_keyword_error_message": "Something went wrong", //code 0
"rest_keyword_invalid_password":"Password not Valid",//code 0
"rest_keyword_invalid_email":"Email not Valid",//code 0
//auth messages
// signup
  "rest_keyword_user_get": "user get successfully (:", //code 1
  "rest_keyword_trainer_signup": "Trainer Signup successfully", //code 1
  "rest_keyword_trainer_not_signup": "Trainer not Signup ", //code 2
  "rest_keyword_user_signup": "user Signup successfully  ", //code 1
  "rest_keyword_user_not_signup": "user not Signup  ", //code 2
  // login
  "rest_keyword_user_login": "User login successfully",//code 1
  "rest_keyword_user_not_login": "User not found",//code 2
  "rest_keyword_trainer_login": "Trainer login successfully",//code 1
  "rest_keyword_trainer_not_login": "Trainer not found",//code 2
  // logout
  "rest_keyword_user_logout":"User logout sucessfully",
  "rest_keyword_trainer_logout":"Trainer logout sucessfully",
  // forget password
  "rest_keyword_password_forget for user":"User forget password email sent",//code 1
  "rest_keyword_password_forget for user":"User  email not found",//code 2
  "rest_keyword_password_forget for trainer":"Trainer forget password email sent",//code 1
  "rest_keyword_user_null for tariner":"Trainer email not found",//code 2
  // update password
  "rest_keyword_password_update ":"Password Upadted",//code 1
  "rest_keyword_password_not_update ":"Password not Upadte",//code 0
  "rest_keyword_password_update for trainer":"Trainer Password Upadted",//code 1
  "rest_keyword_password_not_update for trainer":"Trainer password  not Upadte",//code 1
  // complete profile
  "rest_keyword_user_complete_profile":"Complete Profile sucess",
  "rest_keyword_user_not_complete_profile":"User Not found",
  //  card details
  "rest_keyword_card_details":"Card data inserted ",
  "rest_keyword_card_details_not":"Card data  not insert ",
  //  delete card 
  "rest_keyword_card_details_delete":"Card data Deleted",
  "rest_keyword_card_details_delete_not":"Card data not Delete "
}
module.exports = massages;