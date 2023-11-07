const { Event } = require('../models/event')
const express = require('express');
const router = express.Router();








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
router.post(`/`, async (req, res) => {

    try{
        let event = new Event({
            // image: req.body.image,
            image: req.body.image,

        });

        event = await event.save();



        res.send(event);
    }catch(err){
        res.status(500).send('The Event cannot be created');
    }
});


router.delete('/:id', (req, res) => {
    try {
        Event.findByIdAndRemove(req.params.id)
            .then(event => {
                if (event) {
                    return res.status(200).json({ success: true, message: 'Image Event is delete' })
                } else { 
                    return res.status(404).json({ success: false, message: 'Image Event is delete' })
                }
            })
    } catch (err) { 
        console.log(err)
        return res.status(404).json({ success: false, error: err })
    }

})




module.exports = router;




