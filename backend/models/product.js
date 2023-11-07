const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required:true
    },

    image: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        // required: true
    },
    location: {
        type: String,
    },

    rating: {
        type: String,
    },
    provine:{
        type:String
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    // reviews: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Review',
    //     // required: true
    // }],
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
})


//สร้าง tabel Product โดยเรียกใช้ function productSchema
exports.Product = mongoose.model('Product', productSchema);