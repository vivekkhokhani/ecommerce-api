const express = require('express');
const router = express()
const productCtrl = require('../controller/product.controller')
const imageUpload = require('../service/imageupload')

router.post('/', imageUpload.productUpload.any('images'), productCtrl.addProduct)

router.get('/', productCtrl.getProduct)

router.put('/:productId', productCtrl.updateProduct)

router.put('/image/:imageId', imageUpload.productUpload.any('images'), productCtrl.updateImages)

router.delete('/:productId', productCtrl.deleteProduct)

module.exports = router;



