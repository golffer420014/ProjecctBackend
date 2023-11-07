const mongoose = require('mongoose');


const communitySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
    },
    desc: {
        type: String,
    },
    likes: {
        type: [String],
        default: []
    },
    province:{
        type:String
    }
    
   
}, {timestamps:true})

communitySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

communitySchema.set('toJSON', {
    virtuals: true,
})


//สร้าง tabel Product โดยเรียกใช้ function productSchema
exports.Community = mongoose.model('Community', communitySchema);