const express = require('express')
const router = express()
const cityCtrl = require('../controller/city&state.controller')

router.get('/',cityCtrl.getAllCity)



module.exports = router