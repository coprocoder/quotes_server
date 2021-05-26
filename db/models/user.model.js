var mongoose = require('mongoose');

//User Schema
//const UserSchema = mongoose.Schema({
//    password:{
//        type: String,
//        required: true
//    },
//    email:{
//        type: String,
//        required: true
//    }
//});

module.exports = mongoose.model('User',{
	id: String,
	password: String,
	email: String,
});
