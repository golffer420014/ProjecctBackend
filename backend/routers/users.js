const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
// create
router.post('/', async (req, res) => {
    try {
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            // passwordHash: (req.body.passwordHash),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        })
        user = await user.save();

        res.send(user)
    } catch (err) {
        return res.status(404).send('user cannot  be create')
    }

})
//put
router.put(`/:id`, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json("User not found");
        }

        const userUpdate = await User.findOneAndUpdate(
            { _id: req.params.id },
            {
                fname: req.body.fname || user.fname,
                lname: req.body.lname || user.lname,
                email: req.body.email || user.email,
                address: req.body.address || user.address,
                birth: req.body.birth || user.birth,
                gender: req.body.gender || user.gender,
                image: req.body.image || user.image,
            },
            { new: true }
        );

        return res.status(200).json(userUpdate);
         
    } catch (error) {
        return res.status(500).json(error);
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
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "user not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

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

//register
router.post('/register', async (req, res) => {
    try {
        let user = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            address: req.body.address,
            isAdmin: req.body.isAdmin,
            birth: req.body.birth,
            gender: req.body.gender,
            image: req.body.image,
        })
        user = await user.save();


        res.send(user);
    } catch (err) {
        return res.status(400).send('the user cannot be created!')
    }
})


module.exports = router;