const { CheckIn } = require("../models/check-in");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fsUpdate = require("fs").promises;
const fsDelete = require("fs");
const path = require("path");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    // cb = callback
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    //ทุกพื้นที่ว่างจะถูกเติมด้วย - เช่น 'golf suriya' จะเป็น 'golf-suriya'
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// http://localhost:3000/api/v1/check-in
// list
router.get(`/`, async (req, res) => {
  try {
    const checkInList = await CheckIn.find(); //ค้นหาข้อมูล

    res.status(200).send(checkInList);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// read
router.get(`/:id`, async (req, res) => {
  try {
    const checkInList = await CheckIn.findById(req.params.id) //ค้นหาข้อมูล

    res.status(200).send(checkInList);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// create
router.post("/", uploadOptions.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return console.log("No image uploaded");
    console.log(file);

    const fileName = file.filename;
    const localhost = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let checkIn = new CheckIn({
      userId: req.body.userId,
      productId: req.body.productId,
      image: `${localhost}${fileName}`, // multer จะใส่ path ของไฟล์ที่อัปโหลดไว้ใน req.file.path
      desc: req.body.desc,
      date: req.body.date,
      productName: req.body.productName,
      province: req.body.province,
    });
    checkIn = await checkIn.save();

    res.send(checkIn);
  } catch (error) {
    res.status(500).send({
      message: "The check-in cannot be created!",
      error: error.message,
    });
  }
});

// delete
router.delete("/:id", async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (checkIn) {
      // สมมติว่า 'image' เป็น path ไปยังไฟล์รูปภาพที่เกี่ยวข้องกับหมวดหมู่
      const filePath = checkIn.image.replace(
        `${req.protocol}://${req.get("host")}/`,
        ""
      );
      console.log("img =", filePath);
      // ลบไฟล์ออกจากระบบไฟล์
      fsDelete.unlink(filePath, (err) => {
        if (err) {
          // จัดการกับข้อผิดพลาดหากไฟล์ไม่มีอยู่หรือไม่สามารถลบได้
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: "ไม่สามารถลบไฟล์รูปภาพได้" });
        }

        // ไฟล์ถูกลบแล้ว, ตอนนี้ลบข้อมูลหมวดหมู่ออกจากฐานข้อมูล
        CheckIn.findByIdAndRemove(req.params.id)
          .then(() => {
            return res
              .status(200)
              .json({
                success: true,
                message: "ลบหมวดหมู่และไฟล์รูปภาพเรียบร้อย",
              });
          })
          .catch((err) => {
            console.error(err);
            return res
              .status(500)
              .json({ success: false, message: "ไม่สามารถลบหมวดหมู่ได้" });
          });
      });
    } else {
      return res.status(404).json({ success: false, message: "ไม่พบหมวดหมู่" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
