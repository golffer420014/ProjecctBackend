const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// http://localhost:3000/api/v1/user
router.get(`/`, async (req, res) => {
    try {
        const userList = await User.find()//ค้นหาข้อมูล
        // .select('-passwordHash')

        if (userList) {
            console.log('user success')
        }
        res.send(userList)
    } catch (err) {
        res.status(500).json({ success: false })

    }
})
// read
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-passwordHash')


        res.status(200).send(user);
    } catch (err) {
        res.status(500).json({ message: 'User ID not found' });
    }

})
// // create
// router.post('/', uploadOptions.single('image'), async (req, res) => {
//     try {
//         const fileName = file.filename
//         const localhost = `${req.protocol}://${req.get('host')}/public/uploads/`;
//         let user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             passwordHash: bcrypt.hashSync(req.body.password, 10),
//             phone: req.body.phone,
//             isAdmin: req.body.isAdmin,
//             street: req.body.street,
//             apartment: req.body.apartment,
//             zip: req.body.zip,
//             city: req.body.city,
//             country: req.body.country,
//         })
//         user = await user.save();

//         res.send(user)
//     } catch (err) {
//         return res.status(404).send('user cannot  be create')
//     }

// })
//register
router.post('/register', uploadOptions.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send('No image uploaded');

        const fileName = file.filename;
        const localhost = `${req.protocol}://${req.get('host')}/public/uploads/`;
        let user = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            address: req.body.address,
            isAdmin: req.body.isAdmin,
            birth: req.body.birth,
            gender: req.body.gender,
            image: `${localhost}${fileName}`,
        });
        user = await user.save();

        res.send(user);
    } catch (err) {
        console.error(err); // เพิ่มการบันทึกข้อผิดพลาดไว้ด้วย
        return res.status(400).send('the user cannot be created!');
    }
});
//put
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json("User not found");
        }
        let imagepath = user.image; // เก็บ path เก่าไว้สำหรับการเปรียบเทียบ
        const file = req.file;

        if (file) {
            //ลบรูปเก่าถ้ามีรูปใหม่
            if (imagepath) {
              const oldImagePath = user.image.replace(
                `${req.protocol}://${req.get("host")}/`,
                ""
              );
              await fsUpdate.unlink(oldImagePath); // ใช้ fs.promises เพื่อให้สามารถ await ได้

              // เซ็ต path ใหม่สำหรับรูปใหม่
              const fileName = file.filename;
              const basePath = `${req.protocol}://${req.get(
                "host"
              )}/public/uploads/`;
              imagepath = `${basePath}${fileName}`;
            }

            
        }
        const updatedUser = await User.findByIdAndUpdate(
           {_id: req.params.id},
            {
                image: imagepath || user.image,
                fname: req.body.fname || user.fname,
                lname: req.body.lname || user.lname,
                address: req.body.address || user.address,
                birth: req.body.birth || user.birth,
                gender: req.body.gender || user.gender,
            },
            { new: true }
        );
        res.send(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});



//put password
router.put(`/password/:id`, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json("User not found");
        }


        // เข้ารหัสรหัสผ่านใหม่
        const newPasswordHash = bcrypt.hashSync(req.body.password, 10);

        // อัปเดทรหัสผ่านในฐานข้อมูล
        const passwordUpdated = await User.findByIdAndUpdate(
            req.params.id,
            { passwordHash: newPasswordHash },
            { new: true }
        );

        if (!passwordUpdated) {
            return res.status(400).json("Password update failed");
        }

        // ส่งค่ากลับหรือส่งสถานะสำเร็จกลับไป
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
});

//get forgetPassword
router.get(`/forgetPassword/:email`, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json("User not found");
        }

        res.send(user)


    } catch (error) {
        return res.status(500).json(error);
    }
});


//delete
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Assuming the image property contains a URL like 'http://10.0.2.2:3000/public/uploads/image.png'
            // You need to extract the file path after the domain.
            const urlParts = new URL(user.image);
            const filePath = path.join('public', 'uploads', path.basename(urlParts.pathname));
            console.log(filePath)
            // First, delete the image file
            fsDelete.unlink(filePath, async (err) => {
                if (err) {
                    // If the file does not exist, log the error but still try to remove the user from the database
                    console.error(err);
                }
                // Whether the image was deleted or not, try to remove the user
                
            });
            try {
                await User.findByIdAndRemove(req.params.id);
                return res.status(200).json({ success: true, message: 'ลบผู้ใช้และไฟล์รูปภาพเรียบร้อย' });
            } catch (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'ไม่สามารถลบผู้ใช้ได้' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err });
    }
});



// count
router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments();

        res.send({
            userCount: userCount
        });
    } catch (err) {
        // err
        res.status(500).json({ success: false });
    }
});

//login
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )

        res.status(200).send({
            user: user.email,
            // phone: user.phone,
            token: token,
        })
    } else {
        res.status(400).send('password is wrong!');
    }
})





module.exports = router;