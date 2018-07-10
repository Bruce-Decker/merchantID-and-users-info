const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({ 
    email: {
    	type: String,
    	require: true
    },
    username: {
        type: String,
        require: true
    },
    password: {
    	type: String,
    	require: true
    },
    merchantID: {
    	type: String,
    	require: true
    },
    address: {
        type: String,
        require: true
    }
})

module.exports = User = mongoose.model('users', UserSchema);