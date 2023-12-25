const mongoose = require("mongoose");

const calendarNoteSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  start: {
    type: String, // หรือจะใช้ Date ก็ได้ตามความเหมาะสม
    // required: true,
  },
  duration: {
    type: String, // หรือจะใช้ Date ก็ได้ตามความเหมาะสม
    // required: true,
  },
  note: {
    type: String,
    // required: true,
  },
});

calendarNoteSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

//สร้าง tabel category โดยเรียกใช้ function categorySchema

exports.CalendarNote = mongoose.model("CalendarNote", calendarNoteSchema);

