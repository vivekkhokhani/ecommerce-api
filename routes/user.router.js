var express = require('express');
var router = express.Router();
const userCtrl = require('../controller/user.controller')
const fileupload = require('../service/imageupload')
const verify = require('../middleware/middleware')
const middleware = require('../middleware/middleware')
router.post('/', fileupload.userProfile.any('image'), userCtrl.register)

router.post('/login/', userCtrl.signin)

router.get('/userdetail/', verify.jwtoken, userCtrl.userDetail)

router.get('/', userCtrl.getAllUser)

router.put('/:userId', fileupload.userProfile.any('image'), userCtrl.updateUser)

router.delete('/:userId', userCtrl.deleteData)



module.exports = router;
