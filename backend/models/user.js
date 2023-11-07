const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    birth: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    image:{
        type:String,
        default:null
    }
    // zip :{
    //     type: String,
    //     default: ''
    // },
    // city: {
    //     type: String,
    //     default: ''
    // },
    // country: {
    //     type: String,
    //     default: ''
    // }

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;