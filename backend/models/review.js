const mongoose = require('mongoose');


const reviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    desc:{
        type:String,
        required: true
    },
    rating:{
        type:Number,
        required: true
    }
}, { timestamps: true })

reviewSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

reviewSchema.set('toJSON', {
    virtuals: true,
})


//สร้าง tabel Product โดยเรียกใช้ function productSchema
exports.Review = mongoose.model('Review', reviewSchema);