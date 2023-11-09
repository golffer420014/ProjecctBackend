const { Event } = require('../models/event')
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



//list
router.get(`/`, async (req, res) => {
    try {
        const EventList = await Event.find();//ค้นหาข้อมูล 

        res.status(200).send(EventList)
    } catch (err) {
        res.status(500).json({ success: false })
    }

})



//post
router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    try{
        const file = req.file;
        if (!file) return console.log('No image uploaded');

        const fileName = file.filename;
        const localhost = `${req.protocol}://${req.get('host')}/public/uploads/`;

        let event = new Event({
            // image: req.body.image,
            image: `${localhost}${fileName}`,

        });

        event = await event.save();



        // res.send(event);
    }catch(err){
        res.status(500).send('The Event cannot be created');
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            // Assuming the image property contains a URL like 'http://10.0.2.2:3000/public/uploads/image.png'
            // You need to extract the file path after the domain.
            const urlParts = new URL(event.image);
            const filePath = path.join('public', 'uploads', path.basename(urlParts.pathname));
            // First, delete the image file
            fsDelete.unlink(filePath, async (err) => {
                if (err) {
                    // If the file does not exist, log the error but still try to remove the event from the database
                    console.error(err);
                }
                // Whether the image was deleted or not, try to remove the event
                try {
                    await Event.findByIdAndRemove(req.params.id);
                    return res.status(200).json({ success: true, message: 'ลบผู้ใช้และไฟล์รูปภาพเรียบร้อย' });
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'ไม่สามารถลบผู้ใช้ได้' });
                }
            });
        } else {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err });
    }
});




module.exports = router;




