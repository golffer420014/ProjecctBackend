const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
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
        cb(uploadError, 'C:\Users\golfy\Desktop\App\backend\public\categoryImage')
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
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.send(category);
})
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
router.delete('/:id', (req, res) => {
    try {
        Category.findByIdAndRemove(req.params.id)
            .then(category => {
                if (category) {
                    return res.status(200).json({ success: true, message: 'category is delete' })
                } else {
                    return res.status(404).json({ success: false, message: 'category not found' })
                }
            }) 
    } catch (err) {
        return res.status(404).json({ success: false, error: err })
    } 
       
})


module.exports = router;