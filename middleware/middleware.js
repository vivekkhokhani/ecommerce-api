const db = require('../model/db');
const user = db.user
const jwt = require('jsonwebtoken');
const errResponses = require('../response/error.response');


exports.jwtoken = async (req, res, next) => {
  try {
    if (!req.headers.token) {
      return errResponses.validationError(res, 'token', "Token is required in header", 'headers')
    }
    var decode = jwt.verify(req.headers.token, process.env.jwtkey)


    const checkUser = await user.findOne({
      where: { id: decode.id }
    })
    if (!checkUser) {
      return errResponses.validationError(res, 'token', "Token is invalid", 'headers')
    }
    req.userId = decode.id
    next()
  } catch (error) {
    return errResponses.catchErrorMessage(res, error)
  }
}

exports.checkfile = async (req,res,next) => {
  if(req.length > 1){
    return res.send('not valid')
    next()
  }
}
