const db = require('../model/db')
const user = db.user
const product = db.product
const order = db.order
const productReview = db.productRating
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.EncryptDataKey, { saltLength: 10 })
const errorResponse = require('../response/error.response')
const successResponses = require('../response/success.response')


const addReting = async (req, res) => {
    try {
        if (!req.body.userId || typeof req.body.userId == 'undifined') {
            return errorResponse.validationError(res, 'userId')
        }
        try {
            var userId = cryptr.decrypt(req.body.userId);
        } catch (error) {
            return errorResponse.validationError(res, 'userId', 'invalid user id provided.')
        }

        const userData = await user.findByPk(userId)
        if (!userData) {
            return errorResponse.validationError(res, "", "The requested user was not found.");
        }
        if (!req.body.productId || typeof req.body.productId == 'undifined') {
            return errorResponse.validationError(res, 'ProductId')
        }
        try {
            var productId = cryptr.decrypt(req.body.productId);
        } catch (error) {
            return errorResponse.validationError(res, 'ProductId', 'invalid product id provided.')
        }

        const productData = await product.findByPk(productId)
        if (!productData) {
            return errorResponse.validationError(res, "", "The requested product was not found.");
        }
        if (req.body.review == '' || typeof req.body.review == 'undefined') {
            return errorResponse.validationError(res, 'rating')
        }

        const checkOrder = await order.findOne({
            where: {
                UserId: userId,
                status: "success"
            }
        })
        if (!checkOrder) {
            return errorResponse.notFoundError(res, "Sorry! You are not allowed to review this product since you have'nt bought it. ")
        }
        req.body.UserId = userId,
            req.body.ProductId = productId

        const userReview = await productReview.create(req.body)
        const ratingId = cryptr.encrypt(userReview.id)

        const data = {
            id: ratingId,
            userRating: userReview.rating,
            review: userReview.review,
            user: {
                firstName: userData.firstName,
                lastName: userData.lastName
            }
        }
        return successResponses.responseMessage(res, 201, "Thank you! Your review has been received successfully.", data)

    } catch (error) {
        return errorResponse.catchErrorMessage(res, error);
    }
}


module.exports = {
    addReting
}