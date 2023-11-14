const { Review } = require('../models/review');
const { User } = require('../models/user');
const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();


// http://localhost:3000/api/v1/review
router.get(`/`, async (req, res) => {
    try {
        const reviews = await Review.find().populate('productId', 'id name').populate('userId', 'id fname lname image');

        if (reviews) {
            // Rereview fields of each review
            const rereviewedReviews = reviews.map(review => {
                return {
                    productId: review.productId,
                    userId: review.userId,
                    _id: review._id,
                    desc: review.desc,
                    rating: review.rating,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                    __v: review.__v,
                    id: review.id
                };
            });

            console.log('Reviews fetched successfully');
            res.json(rereviewedReviews);
        }
    } catch (err) {
        console.error('Failed to fetch reviews:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});
router.get(`/:id`, async (req, res) => {
    try {
        const Read = await Review.findById(req.params.id).populate('userId', 'image fname lname');

        res.status(200).json(Read)
    } catch (err) {
        res.status(500).json({ success: false })
    }

})

router.post(`/`, async (req, res) => {
    try {

        const user = User.findById(req.body.userId)
        const product = Product.findById(req.body.productId)
        const isEmpty = Object.values(req.body).some((v) => !v);
        if (isEmpty) {
            throw new Error("Fill all fields!");
        }

        if(!user || !product){
            throw new Error("not fond user || product fields!");
        }

        const Post = await Review.create({
            ...req.body,
            userId: req.body.userId,
            productId: req.body.productId,
        })

        res.send(Post) 
    } catch (error) {
        return res.status(500).json(error.message);
    }
})

// delete
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndRemove(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the review' });
    }
});

module.exports = router;