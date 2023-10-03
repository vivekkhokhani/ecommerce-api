const express = require('express')
const router = express()
const cartDetail = require('../controller/usercart.controller')

router.post('/', cartDetail.createCart)

router.get('/', cartDetail.allCartProduct)

router.put('/:cartId', cartDetail.updateCart)

router.delete('/:cartId', cartDetail.deletecart)

module.exports = router