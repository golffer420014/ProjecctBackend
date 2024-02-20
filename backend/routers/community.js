const { Community } = require("../models/community");
const { User } = require("../models/user");
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

// http://localhost:3000/api/v1/community

//TimeLine
router.get(`/timelinePosts`, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const userPosts = await Community.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Community.find({ userId: friendId });
      })
    );
    return res.json(
      userPosts.concat(...friendPosts).sort((a, b) => b.createdAt - a.createdAt)
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

//list
router.get(`/`, async (req, res) => {
  try {
    const CommunityList = await Community.find().populate(
      "userId",
      "image fname lname"
    );

    res.status(200).send(CommunityList);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
//read
router.get(`/:id`, async (req, res) => {
  try {
    const Read = await Community.findById(req.params.id).populate(
      "userId",
      "image fname lname"
    );

    res.status(200).json(Read);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
//post
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  try {
    // ตรวจสอบว่ามีไฟล์ภาพหรือไม่
    const file = req.file;
    let imagePath = "";
    if (file) {
      const fileName = file.filename;
      const localhost = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagePath = `${localhost}${fileName}`;
    }

    // สร้างโพสต์
    const Post = await Community.create({
      userId: req.body.userId,
      desc: req.body.desc ,
      province: req.body.province ,
      image: imagePath, // ใช้ imagePath ที่ได้ตรวจสอบแล้ว
    });

    res.send(Post);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});

//put
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    const post = await Community.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    let imagepath = post.image;
    const file = req.file;
    
    if (file) {
      // Delete the old image if it exists
      if (imagepath) {
        const oldImagePath = imagepath.replace(
          `${req.protocol}://${req.get("host")}/`,
          ""
        );
        await fsUpdate.unlink(oldImagePath);
      }

      // Set new image path
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
    }

    const updatedPost = await Community.findByIdAndUpdate(
      req.params.id,
      {
        image: imagepath || post.image,
        desc: req.body.desc || post.desc,
        province: req.body.province || post.province,
      },
      { new: true }
    );

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
});


//like
router.put(`/likePost/:id`, async (req, res) => {
  try {
    const post = await Community.findById(req.params.id);
    if (!post) {
      throw new Error("No such post");
    }

    const isLikedByCurrentUser = post.likes.includes(req.body.likes);
    if (isLikedByCurrentUser) {
      throw new Error("Can't like a post two times");
    } else {
      await Community.findByIdAndUpdate(
        req.params.id,
        { $push: { likes: req.body.likes } },
        { new: true }
      );
      return res.status(200).json({ msg: "Post has been successfully liked" });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
});
//diskLike
router.put(`/DislikePost/:id`, async (req, res) => {
  try {
    const post = await Community.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No such post" });
    }

    const isLikedByCurrentUser = post.likes.includes(req.body.likes);
    if (isLikedByCurrentUser) {
      await Community.findByIdAndUpdate(
        req.params.id, // ใช้ req.params.id แทน req.params.postId
        { $pull: { likes: req.body.likes } },
        { new: true }
      );
      return res
        .status(200)
        .json({ msg: "Post has been successfully disliked" }); // ปรับปรุงข้อความตอบกลับ
    } else {
      return res
        .status(400)
        .json({ msg: "Can't dislike a post you haven't liked" }); // ใช้ 400 Bad Request สำหรับสถานการณ์นี้
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message }); // ใช้ msg สำหรับ consistency
  }
});

router.delete(`/:id`, async (req, res) => {
  try {
    const post = await Community.findById(req.params.id);
    if (post) {
      // สมมติว่า 'image' เป็น path ไปยังไฟล์รูปภาพที่เกี่ยวข้องกับสินค้า
      if (post.image) {
        const filePath = post.image.replace(
          `${req.protocol}://${req.get("host")}/`,
          ""
        );
        // console.log("imgggg =", filePath);
        // ลบไฟล์ออกจากระบบไฟล์
        fsDelete.unlink(filePath, (err) => {
          if (err) {
            // จัดการกับข้อผิดพลาดหากไฟล์ไม่มีอยู่หรือไม่สามารถลบได้
            console.error(err);
            return res
              .status(500)
              .json({ success: false, message: "ไม่สามารถลบไฟล์รูปภาพได้" });
          }

          // ไฟล์ถูกลบแล้ว, ตอนนี้ลบข้อมูลสินค้าออกจากฐานข้อมูล
        });
        Community.findByIdAndRemove(req.params.id)
          .then(() => {
            return res.status(200).json({
              success: true,
              message: "ลบสินค้าและไฟล์รูปภาพเรียบร้อย",
            });
          })
          .catch((err) => {
            console.error(err);
            return res
              .status(500)
              .json({ success: false, message: "ไม่สามารถลบสินค้าได้" });
          });
      } else {
        Community.findByIdAndRemove(req.params.id)
          .then(() => { 
            return res.status(200).json({
              success: true,
              message: "ลบสินค้าและไฟล์รูปภาพเรียบร้อย",
            });
          })
          .catch((err) => {
            console.error(err);
            return res
              .status(500)
              .json({ success: false, message: "ไม่สามารถลบสินค้าได้" });
          });
      }
    } else {
      return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
