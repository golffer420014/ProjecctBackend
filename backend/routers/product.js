const { Category } = require('../models/category');
const { Product } = require('../models/product')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer')

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

// http://localhost:3000/api/v1/product
// list
router.get(`/`, async (req, res) => {
    // สามารถค้นหา product ตาม หมวดหมู่ ได้มากกว่า 1 หมวดหมู่
    // ตัวอย่างการใช้งาน ค้นหา product ที่อยู่หมวดหมู่ วัด , ทะเล // เช็ค ID ได้จาก category
    // http://localhost:3000/api/v1/product?category=6513de3a038cc48872286293,6513de41038cc48872286295
    try {
        let filter = {};
        if (req.query.category) {
            console.log(req.query.category)
            filter = { category: req.query.category.split(',') }
        }

        const productList = await Product.find(filter)//ค้นหาข้อมูล
            .populate('category')
        //exmaple .select -> Product.find().select('name iages ratting')

        res.send(productList)
    } catch (err) {
        res.status(500).json({ success: false })

    }

})
//read
router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category').populate('review') // จอยกับ table category

        res.send(product)
    } catch (err) {
        // err
        res.status(500).json({ success: false })
    }
})



//create
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    // if(!file) return res.status(400).send('No image request')

    const fileName = file.filename
    const localhost = `${req.protocol}://${req.get('host')}/public/uploads/`;


    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        rating: req.body.rating,
        provine: req.body.provine,
        category: req.body.category,
        province: req.body.province, // แก้ไขตามที่ถูกต้อง
        image: `${localhost}${fileName}`|| req.body.image, // เส้นทางรูปภาพจากข้างต้น
    });

    try {
        product = await product.save();
        res.send(product);
    } catch (error) {
        // Log the error and send a 500 error response
        console.error(error);
        res.status(500).send('The product cannot be created');
    }
});







// edit

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    // const fileName = file.filename;
    // const baseAndroid = `http://10.0.2.2:3000/public/uploads/`;

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            
            image: imagepath || product.image,
            name: req.body.name || product.name,
            description: req.body.description || product.description,
            category: req.body.category || product.category,
            location: req.body.location || product.location,
            rating: req.body.rating || product.rating,
            image: req.body.image || product.image,
            provine: req.body.provine || product.provine,
            latitude: req.body.latitude || product.latitude,
            longitude: req.body.longitude || product.longitude,
        },
        { new: true }
    );

    if (!updatedProduct)
        return res.status(500).send('the product cannot be updated!');

    res.send(updatedProduct);
});


// delete
router.delete('/:id', (req, res) => {
    try {
        Product.findByIdAndRemove(req.params.id)
            .then(product => {
                if (product) {
                    return res.status(200).json({ success: true, message: 'product is delete' })
                } else {
                    return res.status(404).json({ success: false, message: 'product not found' })
                }
            })
    } catch (err) {
        console.log(err)
        return res.status(404).json({ success: false, error: err })
    }

})

// count
router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        // .populate('category'); // จอยกับ table category

        res.send({
            productCount: productCount
        });
    } catch (err) {
        // err
        console.log(err);
        res.status(500).json({ success: false });
    }
});

// featured เป็น function ที่อยากจะให้โชว์สินค้ากี่อันเช่น products/get/featured/10 ก็จะแสดงสินค้า 10 อัน
//http://localhost:5000/api/v1/products/get/featured/1
router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0
        const product = await Product.find({ isFeatured: true }).limit(+count)
        // .populate('category'); // จอยกับ table category

        res.send(product)
    } catch (err) {
        // err
        console.log(err);
        res.status(500).json({ success: false });
    }
});

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('the gallery cannot be updated!');

        res.send(product);
    }
);



module.exports = router;