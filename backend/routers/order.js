const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item')
const express = require('express');
const router = express.Router();

// http://localhost:3000/api/v1/order
//list
router.get(`/`, async (req, res) => {
    try {
        const orderList = await Order.find()//ค้นหาข้อมูล
            .populate('user', 'name email')//เชื่อมขอมูล table user และดึงเอา name email
            .sort({'dateOrdered':-1})// asc desc

        if (orderList) { console.log('list order') }
        res.send(orderList)
    } catch (err) {
        res.status(500).json({ success: false })
    }
})
//read
router.get(`/:id`, async (req, res) => {
    try {
        const orderRead = await Order.findById(req.params.id)//ค้นหาข้อมูล
            .populate('user', 'name email')//เชื่อมขอมูล table user และดึงเอา name email
            .populate({
                path: 'orderItems', populate: {
                    path: 'product', populate: 'category'
                }
            });
        if (orderRead) { console.log('read order') }
        res.send(orderRead)
    } catch (err) {
        res.status(500).json({ success: false })
    }
})
// create
router.post('/', async (req, res) => {
    try {
        const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            })

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        }))
        const orderItemsIdsResolved = await orderItemsIds

        const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice
        }))
        // totalPrice มีค่าเป็น array เนื่องจากมี product 2 อัน [120,80] โดยค่าเริ่มต้น = 0
        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        })
        order = await order.save();

        if (order) { console.log('add order') }
        res.send(order)
    } catch (err) {
        console.log(err)
        return res.status(404).send('order cannot  be create')
    }
})
// update
router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
               status: req.body.status
            },
            { new: true }
        )

        res.send(order)
    } catch (err) {
        return res.status(404).send('order cannot be update')
    }

})

// delete
router.delete('/:id', (req, res) => {  
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})
// admin dashboard
router.get('/get/totalsales', async (req, res) => {
    try{
        const totalSales = await Order.aggregate([
            // sum all filed totalPrice
            { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
        ])

        res.send({ totalsales: totalSales.pop().totalsales })
    }catch(err){
        return res.status(400).send('The order sales cannot be generated')
    }
})
// history get order
router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})

router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments((count) => count)
        
        res.send({
            orderCount: orderCount
        });
    } catch (err) {
        res.status(500).json({ success: false })
    }
    
})

module.exports = router;