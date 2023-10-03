const express = require('express');
const router = express()
const productReview = require('../controller/productRating.controller')


router.post('/',productReview.addReting)

module.exports = router
