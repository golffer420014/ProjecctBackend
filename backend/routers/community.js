const { Community } = require('../models/community')
const { User } = require('../models/user')
const express = require('express');
const router = express.Router();


// http://localhost:3000/api/v1/community

//TimeLine
router.get(`/timelinePosts`, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const userPosts = await Community.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Community.find({ userId: friendId })
            })
        );
        return res.json(userPosts.concat(...friendPosts).sort((a, b) => b.createdAt - a.createdAt))
    } catch (err) {
        res.status(500).json(err);
    }

})

//list
router.get(`/`, async (req, res) => {
    try {
        const CommunityList = await Community.find().populate('userId', 'image fname lname');

        res.status(200).send(CommunityList)
    } catch (err) {
        res.status(500).json({ success: false })
    }

})
//read
router.get(`/:id`, async (req, res) => {
    try {
        const Read = await Community.findById(req.params.id);//ค้นหาข้อมูล

        res.status(200).json(Read)
    } catch (err) {
        res.status(500).json({ success: false })
    }

})
//post
router.post(`/`, async (req, res) => {
    try {

        const isEmpty = Object.values(req.body).some((v) => !v);
        if (isEmpty) {
            throw new Error("Fill all fields!");
        }

        const Post = await Community.create({ ...req.body || null, userId: req.body.userId })

        res.send(Post)
    } catch (error) {
        return res.status(500).json(error.message);
    }
})
//like
router.post(`/likePost/:id`, async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) {
            throw new Error("No such post");
        }

        const isLikedByCurrentUser = post.likes.includes(req.user.id);
        if (isLikedByCurrentUser) {
            throw new Error("Can't like a post two times");
        } else {
            await Community.findByIdAndUpdate(
                req.params.id,
                { $push: { likes: req.user.id } },
                { new: true }
            );
            return res.status(200).json({ msg: "Post has been successfully liked" });
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }

})
//put
 router.put(`/:id`, async (req, res) => {
try {
    const post = await Community.findById(req.params.id);
    if (post) {
        const updatedPost = await Community.findByIdAndUpdate(
            req.params.id,
            {
                image: req.body.image || post.image,
                desc: req.body.desc || post.desc, 
                province: req.body.province || post.province
            },
            { new: true }
        );

        return res.status(200).json(updatedPost);
    } else {
        throw new Error("You can only update your own posts");
    }
} catch (error) {
    return res.status(500).json(error.message);
}

})

router.delete(`/:id`, async (req, res) => {
    try {
        console.log(req.params.id)
        const post = await Community.findById(req.params.id);
        if (post) {
            await post.delete()
            return res.status(200).json({ msg: "Successfully deleted post" });
        } else {
            throw new Error("You can only delete your own posts");
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
})




module.exports = router;




