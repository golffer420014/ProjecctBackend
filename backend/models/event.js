const mongoose = require('mongoose');


const eventSchema = mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    
})


eventSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});


//สร้าง tabel Event โดยเรียกใช้ function EventSchema
exports.Event = mongoose.model('Event', eventSchema);