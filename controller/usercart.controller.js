const db = require('../model/db')
const cart = db.userCart
const user = db.user
const product = db.product
const cities = db.cities
const state = db.states
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.EncryptDataKey, { saltLength: 10 })
const errorResponse = require('../response/error.response')
const successResponses = require('../response/success.response')

const createCart = async (req, res) => {
    try {

        if (req.body.userId == '' || typeof req.body.userId == 'undefined') {
            return errorResponse.validationError(res, 'userId')
        }

        if (req.body.productId == '' || typeof req.body.productId == 'undefined') {
            return errorResponse.validationError(res, 'productId')
        }

        if (req.body.quantity == '' || typeof req.body.quantity == 'undefined') {
            return errorResponse.validationError(res, 'quantity')
        }

        var productQuantity = parseInt(req.body.quantity)

        if (isNaN(productQuantity) || productQuantity < 1) {
            return errorResponse.validationError(res, 'quantity', "Choose the appropriate quantity of the product.")
        }

        try {
            var originalText = cryptr.decrypt(req.body.userId);
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'Your user id is invalid')
        }

        const userData = await user.findOne({
            where: { id: originalText },
        })
        if (!userData) {
            return errorResponse.notFoundError(res, "The requested user was not found.")
        }

        try {
            var productId = cryptr.decrypt(req.body.productId);
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'Your product id is invalid')
        }

        const products = await product.findOne({
            where: { id: productId }
        })

        if (!products) {
            return errorResponse.notFoundError(res, "The requested product was not found.")
        }

        const checkCart = await cart.findOne({ where: { ProductId: productId, UserId: originalText } })

        if (checkCart) {
            return errorResponse.validationError(res, 'product', 'You have already selected this product. Please update the quantity if needed.')
        }

        const cityName = await cities.findOne({ where: { id: userData.CityId } })
        if (cityName) {
            var stateData = await state.findOne({ where: { id: cityName.StateId } })
        }
        if (stateData) {
            var stateName = stateData.state

        }

        const cartData = await cart.create({
            quantity: req.body.quantity,
            UserId: originalText,
            ProductId: productId
        })
        const cartId = cryptr.encrypt(cartData.id)

        const totalValue = cartData.quantity * products.productPrice

        const userCart = {
            productId: req.body.prouctId,
            productName: products.productName,
            productPrice: Number(products.productPrice),
            totalQuantity: Number(cartData.quantity),
            totalPrice: Number(totalValue.toFixed(2))
        }
        const address = {
            username: `${userData.firstName} ${userData.lastName}`,
            mobileNumber: userData.mobileNumber,
            city: cityName.cities,
            state: stateName
        }
        const data = {
            cartId,
            productDetails: userCart,
            deliveryAddress: address
        }
        return successResponses.responseMessage(res, 201, "Product added to cart!", data)
    } catch (error) {

        return errorResponse.catchErrorMessage(res, error)
    }
}

// get all user cart product

const allCartProduct = async (req, res) => {
    try {

        if (req.query.userId) {
            try {
                var originalText = cryptr.decrypt(req.query.userId);
            } catch (error) {
                return errorResponse.catchErrorMessage(res, error, 'invalid user id provided.')
            }
            var userData = await user.findOne({
                where: { id: originalText },
            })
            if (!userData) {
                return errorResponse.notFoundError(res, "The requested user was not found.")
            }
            var findData = { UserId: originalText }

            var userDetail = {
                id: req.query.userId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                mobileNumber: userData.mobileNumber,
            };
        } else {
            var findData = ''
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

        if (!size || size <= 0) {
            size = 10
        }
        var requireData = ['firstName', 'lastName', 'mobileNumber']

        const { count, rows: cartData } = await cart.findAndCountAll({
            attributes: ['id', 'quantity'],

            where: findData,
            include: [{
                model: product,
            },
            {
                model: user,
                attributes: requireData
            }
            ],
            limit: size,
            offset: (page - 1) * size,
        })

        const products = [];
        let totalCartValue = 0;

        for (const cartItem of cartData) {
            const productItem = cartItem.dataValues.product;
            var cartId = cryptr.encrypt(cartItem.dataValues.id);
            const total = productItem.productPrice * cartItem.quantity;
            const fixedPrice = parseFloat(total.toFixed(2));

            products.push({
                ProductId: cryptr.encrypt(productItem.id),
                productName: productItem.productName,
                productPrice: parseFloat(productItem.productPrice),
                manufacturer: productItem.manufacturer,
                description: productItem.description,
                quantity: Number(cartItem.quantity),
                totalprice: fixedPrice,
            });

            totalCartValue += fixedPrice;
        }

        var totalPage = Math.ceil(count / size);
        if (page > totalPage || products == '') {
            return errorResponse.notFoundError(res, 'data not found');
        }
        page = parseInt(page)


        if (req.query.userId) {

            var data = {
                cartId,
                totalCartValue: totalCartValue,
                userDertail: userDetail,
                products: products,
            }
            return successResponses.responseMessage(res, 200, "Here are the products in your cart.", data)
        } else {
            var pagination = {
                previousPage: page > 1 ? page - 1 : 1,
                curruntPage: page,
                nextPage: page < totalPage ? page + 1 : page == totalPage ? page : 1,
                totalPageData: cartData.length,
                totalRecords: count,
                totalPage: totalPage || 1,
            };
            var data = { products: products }
            return successResponses.paginationResponse(res, 200, "All products in your cart.", pagination, products)
        }
    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}

const updateCart = async (req, res) => {
    try {

        if (!req.params.cartId) {
            return errorResponse.validationError(res, 'params', 'cart id is missing in params parameters.', 'Params')
        }
        try {
            var cartId = cryptr.decrypt(req.params.cartId)
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'invalid cart id provided.')
        }

        const cartsData = await cart.findOne({
            where: { id: cartId }
        })

        if (!cartsData) {
            return errorResponse.notFoundError(res, "The requested product was not found in cart.")
        }
        // const checkCart = await cart.findOne({ where: { ProductId: productId } })
        // if (!checkCart) {
        //     return errorResponse.notFoundError(res, "The requested product not in cart please add product first.")
        // }
        await cart.update(req.body, { where: { id: cartId } })

        const cartData = await cart.findOne({
            where: { id: cartId },
            include: [{
                model: product
            }]
        })

        const products = await product.findOne({
            where: { id: cartData.product.id }
        })

        const totalValue = cartData.quantity * products.productPrice

        const userCart = {
            productId: req.params.productId,
            productName: products.productName,
            productPrice: Number(products.productPrice),
            totalQuantity: Number(cartData.quantity),
            totalPrice: totalValue
        }
        return successResponses.responseMessage(res, 200, "Cart updated!", userCart)

    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}

const deletecart = async (req, res) => {
    try {

        if (!req.params.cartId) {
            return errorResponse.validationError(res, 'params', 'cart id is missing in params parameters.', 'Params')
        }

        try {
            var cartId = cryptr.decrypt(req.params.cartId)
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'invalid cart id provided.')
        }

        const cartData = await cart.findOne({
            where: { id: cartId }
        })

        if (!cartData) {
            return errorResponse.notFoundError(res, "The requested product was not found in cart.")
        }

        await cart.destroy({ where: { id: cartId } })
        return successResponses.responseMessage(res, 200, "Item removed from cart.")

    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}
module.exports = {
    createCart,
    allCartProduct,
    updateCart,
    deletecart
}