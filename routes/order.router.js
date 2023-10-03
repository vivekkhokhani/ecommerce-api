const express = require('express')
const router = express()
const orderCtrl = require('../controller/order.controller')

router.post('/',orderCtrl.placeOrder)

router.get('/',orderCtrl.allOrder)

router.get('/confirmOrder/:userId',orderCtrl.confirmOrder)

module.exports = router