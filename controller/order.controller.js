const db = require('../model/db')
const user = db.user
const product = db.product
const order = db.order
const cart = db.userCart
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.EncryptDataKey, { saltLength: 10 })
const errorResponse = require('../response/error.response')
const successResponses = require('../response/success.response')

const placeOrder = async (req, res) => {
    try {
        if (!req.body.userId || typeof req.body.userId == 'undefined') {
            return errorResponse.validationError(res, 'userId')
        }
        try {
            var originalText = cryptr.decrypt(req.body.userId);
        } catch (error) {
            return errorResponse.validationError(res, 'userId', 'invalid user id provided.')
        }

        const userData = await user.findByPk(originalText);
        if (!userData) {
            return errorResponse.validationError(res, "", "The requested user was not found.");
        }

        const userCart = await cart.findAll({
            where: { UserId: originalText },
            include: [
                {
                    model: product,
                    required: false,
                    attributes: ['productName', 'productPrice']
                },
            ]
        })

        let productData = []
        let totalCartValue = 0
        const createOrders = [];

        for (const user of userCart) {
            var total = user.product.productPrice * user.quantity;
            const fixedPrice = parseFloat(total.toFixed(2));
            user.product.dataValues.totalPrice = fixedPrice;
            user.product.dataValues.productPrice = Number(user.product.dataValues.productPrice);
            user.product.dataValues.productQuantity = user.quantity;

            createOrders.push({
                ProductId: user.ProductId,
                UserId: Number(originalText),
                totalPrice: fixedPrice,
            });

            productData.push(user.product);
            totalCartValue += fixedPrice;
        }

        if (!userCart || userCart == '') {
            return errorResponse.notFoundError(res, 'Product not found in cart')
        }

        const createdOrders = await order.bulkCreate(createOrders);


        createdOrders.forEach((order, index) => {
            productData[index].dataValues.orderId = cryptr.encrypt(order.id);
        });

        const data = {
            UserId: req.body.userId,
            totalOrderPrice: parseFloat(totalCartValue.toFixed(2)),
            productData
        }

        return successResponses.responseMessage(res, 201, "Your order placed", data)
    } catch (error) {
        return errorResponse.catchErrorMessage(res, error);
    }
}

const confirmOrder = async (req, res) => {
    try {
        if (!req.params.userId) {
            return errorResponse.validationError(res, 'params', 'User id is missing in params parameters.', 'Params')
        }
        try {
            var originalText = cryptr.decrypt(req.body.userId);
        } catch (error) {
            return errorResponse.validationError(res, 'userId', 'invalid user id provided.')
        }
        const orderUser = await order.findAll({
            where: { UserId: originalText }
        })

        if (!orderUser) {
            return errorResponse.notFoundError(res, 'You have not place order first')
        }

        await order.update({ status: 'success' }, {
            where: {
                UserId: originalText
            }
        })

        // const orderDetails = await order.findAll                                //add confirm order details in response

        cart.destroy({ where: { UserId: originalText } })
        return successResponses.responseMessage(res, 200, 'Your order place successfully')
    } catch (error) {
        return errorResponse.catchErrorMessage(res, 200, error);
    }
}

const allOrder = async (req, res) => {
    try {

        // if (!req.params.userId) {
        //     return errorResponse.validationError(res, 'params', 'user id is missing in params parameters.', 'Params')
        // }
        // if (req.params.userId) {
        //     try {
        //         var originalText = cryptr.decrypt(req.params.userId);
        //     } catch (error) {
        //         return errorResponse.catchErrorMessage(res, error, 'invalid user id provided.')
        //     }
        // }

        if (req.query.filter == 'pending' || req.query.filter == 'success') {
        } else {
            return errorResponse.validationError(res, 'params', 'Please select valid filter')
        }
        if (req.query.page) {
            if (!req.query.page.match('^[0-9]*$')) {
                return errorResponse.validationError(res, 'page', 'Please enter valid page number')
            }
            var page = req.query.page;
        }

        if (page <= 0 || !page) {
            page = 1;
        }
        if (req.query.size) {
            if (!req.query.size.match('^[0-9]*$')) {
                return errorResponse.validationError(res, 'size', 'Please enter valid size')
            }
            var size = parseInt(req.query.size);
        }

        if (size <= 0 || !size) {
            size = 10;
        }

        id = (req.query.order == 0) ? ['id', 'DESC'] : ['id', 'ASC'];

        var { count, rows: allUserOrder } = await order.findAndCountAll({
            group: ['UserId', 'ProductId'],
            offset: (page - 1) * size,
            limit: size,
            where: { status: req.query.filter },
            include: [
                {
                    model: user,
                    attributes: ['firstName', 'lastName', 'mobileNumber'],
                }
            ]
        })

        allUserOrder.map((el) => {

            el.dataValues.id = cryptr.encrypt(el.id)
            el.dataValues.UserId = cryptr.encrypt(el.UserId)
            el.dataValues.ProductId = cryptr.encrypt(el.ProductId)
            el.totalPrice = Number(el.totalPrice)
        })
        // var totalPage = Math.ceil(count.count / size);
        // var pagination = {
        //     previousPage: page > 1 ? page - 1 : parseInt(page),
        //     curruntPage: parseInt(page),
        //     nextPage: page < totalPage ? parseInt(page) + 1 : parseInt(page),
        //     totalPageData: allUserOrder.length,
        //     totalOrderRecords:count.count ,
        //     totalPage: totalPage || 1
        // };

        return successResponses.responseMessage(res, 200, 'All order data',allUserOrder)
    } catch (error) {
        return errorResponse.catchErrorMessage(res, error);
    }
}


module.exports = {
    placeOrder,
    allOrder,
    confirmOrder,

}