const mongoose = require('mongoose');


const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    type: {
        type: String,
    }
})


categorySchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});

 
//สร้าง tabel category โดยเรียกใช้ function categorySchema
exports.Category = mongoose.model('Category', categorySchema);