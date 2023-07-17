const Order = require('../model/orderModel')
const RazorPay = require('razorpay')
const User = require('../model/userModel')
const user = require('./userCont')
//const { where } = require('sequelize')

const purchasepremium = async (req,res) => {
    try{
        console.log('in premium', req.user.isPremiumUser)
    if(req.user.isPremiumUser === true){
        return res.json({message:'premium user', success: true})
    }
    else{
        console.log('process.env>>>>>>>>>>>>>>>>>',process.env.RZP_KEY_ID)
            var rzp = new RazorPay({
                key_id: 'rzp_test_3LFmNQEupRgD3l',
                key_secret: '0tCbImvGn61VGiqqEsH0FjmU'
            })
            const amount = 2500
            
    
            rzp.orders.create({amount, currency: "INR"}, async(err, order) => { //calling razorpay backend
                if(err){
                    throw new Error(JSON.stringify(err));
                }
                const newOrder = new Order({
                    orderid: order.id,
                    status: 'PENDING',
                    userId: req.user._id
                })
                await newOrder.save()
                //console.log('Inside rzp order')

                return res.status(201).json({order, key_id: rzp.key_id})
                
                // req.user.createOrder({orderid: order.id, status: 'PENDING'}) // calling our backend
                //     .then(()=> {
                //         return res.status(201).json({order, key_id: rzp.key_id})
                //     })
                //     .catch(err=>console.log(err))
            })
    
        }
        

    }
    catch(err){
        console.log(err)
        res.status(403).json({message: 'Something went wrong', error: err})
    }
    
    
        
}

const updatetransactionstatus = async (req, res) => {
    try{
        const {payment_id, order_id} = req.body
        const order = await Order.findOne({'orderid': order_id})
        console.log(order)
        order.paymentid = payment_id
        order.status = 'SUCCESSFULL'
        //const order = await Order.findOne({where: {orderid : order_id}})
        const promise1= order.save()
        //const promise1= order.update({paymentid: payment_id, status: 'SUCCESSFULL'})
        // const promise1= order.update({paymentid: payment_id, status: 'SUCCESSFULL'})
        
        const userUpdate = await User.findById({'_id': req.user._id})
        console.log(userUpdate)
        userUpdate.isPremiumUser = true
        const promise2 = userUpdate.save()

        Promise.all([promise1,promise2]).then(()=> {
            return res.status(201).json({message: 'Transaction Successfull', success: true})
        })
        .catch(err=>console.log(err))                                  

    }
    catch(err){
        throw new Error(err)
    }
        
}

const transactionFailed = (req,res) => {
    try{
        console.log('req body>>>>>',req.body)
        const order_id = req.body.order_id
        Order.findOne({'orderid': order_id})
             .then((order)=> {
                order.status = 'FAILED'
                order.save()
                //order.update({status: 'FAILED'})
                .then(()=> {
                    return res.json({message: 'Transaction Failed', success: false})
                  })
                  .catch(err=>console.log(err))                
              }) 
             .catch(err=>console.log(err))

    }
    catch(err){
        throw new Error(err)
    }
    

}

module.exports = {
    purchasepremium,
    updatetransactionstatus, 
    transactionFailed
}