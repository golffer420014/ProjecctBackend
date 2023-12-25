const { CalendarNote } = require("../models/calndar-note");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();


// http://localhost:3000/api/v1/calendar-note
// list
router.get(`/`, async (req, res) => {
  try {
    console.log('hello api')
    const calendarList = await CalendarNote.find(); //ค้นหาข้อมูล

    res.status(200).send(calendarList);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// read
router.get(`/:id`, async (req, res) => {
  try {
    const calendarList = await CalendarNote.findById(req.params.id); //ค้นหาข้อมูล

    res.status(200).send('dawdwad');
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.post(`/`, async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findById(req.body.userId);

    // ตรวจสอบว่ามีข้อมูลที่ส่งมาทั้งหมดหรือไม่
    const isEmpty = Object.values(req.body).some((v) => !v);
    if (isEmpty) {
      throw new Error("Fill all fields!");
    }

    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!user) {
      throw new Error("User not found");
    }

    // สร้าง CalendarNote
    const post = new CalendarNote({
      userId: req.body.userId,
      start: req.body.start,
      duration: req.body.duration,
      note: req.body.note,
    });
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
