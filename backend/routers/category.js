const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const multer = require('multer')
const fsUpdate = require('fs').promises;
const fsDelete = require('fs');
const path = require('path');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        // cb = callback
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        //ทุกพื้นที่ว่างจะถูกเติมด้วย - เช่น 'golf suriya' จะเป็น 'golf-suriya'
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})

const uploadOptions = multer({ storage: storage })

// http://localhost:3000/api/v1/category 
// list
router.get(`/`, async (req, res) => { 
    try {
        const categoryList = await Category.find();//ค้นหาข้อมูล

        res.status(200).send(categoryList)
    } catch (err) {
        res.status(500).json({ success: false })
    }
    
})
// read
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        res.status(200).send(category);
    } catch (err) {
        res.status(500).json({ message: 'Category ID not found' });
    }

})
// create
router.post('/', uploadOptions.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return console.log('No image uploaded');
        console.log(file)

        const fileName = file.filename;
        const localhost = `${req.protocol}://${req.get('host')}/public/uploads/`;
        let category = new Category({
          name: req.body.name,
          icon: `${localhost}${fileName}`, // multer จะใส่ path ของไฟล์ที่อัปโหลดไว้ใน req.file.path
          type: req.body.type,
        });
        category = await category.save();

        res.send(category);
    } catch (error) {
        res.status(500).send({
            message: 'The category cannot be created!',
            error: error.message
        });
    }
});
// edit
router.put('/:id',async(req,res)=>{
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                icon: req.body.icon,
                color: req.body.color,
            },
            { new: true }
        )

        res.send(category)
    } catch (err) {
        return res.status(404).send('category cannot be update')
    }
    
})
// delete
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            // สมมติว่า 'image' เป็น path ไปยังไฟล์รูปภาพที่เกี่ยวข้องกับหมวดหมู่
            const filePath = category.icon.replace(`${req.protocol}://${req.get('host')}/`, '');
            console.log('img =', filePath)
            // ลบไฟล์ออกจากระบบไฟล์
            fsDelete.unlink(filePath, (err) => {
                if (err) {
                    // จัดการกับข้อผิดพลาดหากไฟล์ไม่มีอยู่หรือไม่สามารถลบได้
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'ไม่สามารถลบไฟล์รูปภาพได้' });

                }

                // ไฟล์ถูกลบแล้ว, ตอนนี้ลบข้อมูลหมวดหมู่ออกจากฐานข้อมูล
                Category.findByIdAndRemove(req.params.id)
                    .then(() => {
                        return res.status(200).json({ success: true, message: 'ลบหมวดหมู่และไฟล์รูปภาพเรียบร้อย' });
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'ไม่สามารถลบหมวดหมู่ได้' });
                    });
            });
        } else {
            return res.status(404).json({ success: false, message: 'ไม่พบหมวดหมู่' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err });
    }
});

module.exports = router;