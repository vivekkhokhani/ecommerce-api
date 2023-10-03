const db = require('../model/db')
const product = db.product
const user = db.user
const productImage = db.productImage
const productReview = db.productRating
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.EncryptDataKey, { saltLength: 10 })
const sequalize = require('sequelize');
const op = sequalize.Op
const errorResponse = require('../response/error.response')
const successResponses = require('../response/success.response')
const fs = require('fs')

//create product
const addProduct = async (req, res) => {
    try {
        if (req.body.userId == '' || typeof req.body.userId == 'undefined') {
            return errorResponse.validationError(res, 'userId')
        }
        if (req.body.productName == "" || typeof req.body.productName == "undefined") {

            return errorResponse.validationError(res, 'productName')
        }

        if (req.body.productPrice == "" || typeof req.body.productPrice == "undefined") {

            return errorResponse.validationError(res, 'productPrice')
        }
        req.body.productPrice = parseFloat(req.body.productPrice);
        if (isNaN(req.body.productPrice)) {
            return errorResponse.validationError(res, 'productPrice', 'Please enter valid product price')
        }

        if (req.body.manufacturer == "" || typeof req.body.manufacturer == "undefined") {
            return errorResponse.validationError(res, 'manufacturer')
        }

        if (req.body.description == "" || typeof req.body.description == "undefined") {

            return errorResponse.validationError(res, 'description')
        }
        if (req.body.images == '' || typeof req.body.images == "undifined") {

            return errorResponse.validationError(res, 'images', 'Please upload file or image of product')
        }

        if (req.files == "" || req.files.length > 5) {

            return errorResponse.validationError(res, 'images', 'Please upload maximun 5 image')
        }
        const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

        for (let i = 0; i < req.files.length; i++) {
            if (!allowedFileTypes.includes(req.files[i].mimetype)) {

                return errorResponse.validationError(res, 'images', "please upload jpg , png or jpeg file")
            }
        }

        //file size
        const fileSize = 5;
        for (let i = 0; i < req.files.length; i++) {
            if ((req.files[i].size / (1024 * 1024)) > fileSize) {

                return errorResponse.validationError(res, 'images', "File or photo can't be morethan 5 mb")
            }
        }

        var data = req.files.map((el) => el.filename)

        productPicture = data.map((el) => `${process.env.url}${el}`)
        try {
            var originalText = cryptr.decrypt(req.body.userId);
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'invalid user id provide.')
        }

        const userData = await user.findOne({
            where: { id: originalText },
        })
        if (!userData) {
            return errorResponse.notFoundError(res, "The requested user was not found.")
        };
        if (userData.role == 'buyer') {
            return errorResponse.validationError(res, '', "Start selling by registering as a seller.", '-')
        }
        //create data
        req.body.UserId = originalText;
        const createProduct = await product.create(req.body)

        //using bulkcreate.
        var productId = createProduct.id
        const productImagesData = data.map((imageFilename) => ({
            productImages: imageFilename,
            ProductId: productId
        }));

        const createdImages = await productImage.bulkCreate(productImagesData);

        const encryptedProductId = cryptr.encrypt(productId);

        const responseData = createdImages.map(image => {
            return {
                imageId: cryptr.encrypt(image.id),
                productImages: `${process.env.url}${image.productImages}`
            };

        })

        const object = {
            ProductId: encryptedProductId,
            ProductName: createProduct.productName,
            ProductPrice: Number(createProduct.productPrice),
            Manufacturer: createProduct.manufacturer,
            Description: createProduct.description,
            createdAt: createProduct.createdAt,
            updatedAt: createProduct.updatedAt,
            productImages: responseData
        }

        return successResponses.responseMessage(res, 201, "Product has been added successfully", object)
    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}

const getProduct = async (req, res) => {
    try {
        var start = req.query.startDate
        var end = req.query.endDate

        if (!req.query.startDate) {
            start = '2000-01-01';

        }
        if (!req.query.endDate) {
            parseEndDate = new Date()
        }
        else {
            parseEndDate = new Date(`${end}T23:59:59Z`);
        }

        const parseStartDate = new Date(`${start}T00:00:00Z`);

        if (isNaN(parseStartDate)) {
            return errorResponse.validationError(res, 'startDate', "Please enter a valid date", 'params')
        }

        if (isNaN(parseEndDate)) {
            return errorResponse.validationError(res, 'endDate', "Please enter a valid date", 'params')
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

        let searchTerm = req.query.search || ''

        id = (req.query.order == 0) ? ['id', 'DESC'] : ['id', 'ASC'];
    
        var { count, rows: allData } = await product.findAndCountAll({
            group:['id'],
            where: {
                createdAt: {
                    [op.between]: [parseStartDate, parseEndDate]
                },
                [op.or]: [
                    { productName: { [op.like]: '%' + searchTerm + '%' } },
                    { manufacturer: { [op.like]: '%' + searchTerm + '%' } },
                    { description: { [op.like]: '%' + searchTerm + '%' } },
                ],
            },
            include: [{
                model: productImage,
                // separate: true
            },
            {
                model: productReview,
                attributes: ['rating']
            }
            ],
            limit: size,
            offset: (page - 1) * size,
            order: [
                id,
            ]
        })

        // product id encrypted

        const responseData = allData.map(product => {
            const images = product.dataValues.productImages.map(image => {
                return {
                    productImages: `${process.env.url}${image.productImages}`
                };
            });
            const rating = product.ratings
            let totalRatings = 0
            for (const productRating of rating) {
                let parsedRating = parseFloat(productRating.dataValues.rating)

                totalRatings += parsedRating
            }
            let avgRating = parseFloat((totalRatings / rating.length).toFixed(2)) || 0
            product.dataValues.ratings = { avgRating }

            return {
                ...product.dataValues,
                id: cryptr.encrypt(product.dataValues.id),
                UserId: cryptr.encrypt(product.dataValues.UserId),
                productPrice: parseFloat(product.dataValues.productPrice),
                productImages: images
            };
        });

        var totalCount = await product.count();
        var totalPage = Math.ceil(totalCount / size);

        if (searchTerm) {
            totalCount = count.length
            totalPage = Math.ceil(totalCount / size);
        }
   
        if (page > totalPage || responseData == '') {
            return errorResponse.notFoundError(res, 'data not found');
        }
        page = parseInt(page)
        const pagination = {
            previousPage: page > 1 ? page - 1 : 1,
            curruntPage: page,
            nextPage: page < totalPage ? page + 1 : page == totalPage ? page : 1,
            totalPageData: responseData.length,
            totalProductRecords: totalCount,
            totalPage: totalPage || 1,
        };

        return successResponses.paginationResponse(res, 200, "Here is the complete set of all products data", pagination, responseData);

    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}

const updateProduct = async (req, res) => {
    try {

        if (!req.params.productId) {
            return errorResponse.validationError(res, 'params', 'product id is missing in params parameters.', 'Params')
        }
        try {
            var originalId = cryptr.decrypt(req.params.productId)
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'invalid product id provided.')
        }

        const productData = await product.findByPk(originalId)

        if (!productData) {
            return errorResponse.notFoundError(res, 'Your requested product not found')
        }

        await product.update(req.body, { where: { id: productData.id } })

        const updateData = await product.findByPk(productData.id)

        await productImage.findAll({
            where: { ProductId: originalId }
        })


        const encryptId = cryptr.encrypt(updateData.id)

        const object = {
            ProductId: encryptId,
            ProductName: updateData.productName,
            ProductPrice: Number(updateData.productPrice),
            Manufacturer: updateData.manufacturer,
            Description: updateData.description,
            createAt: updateData.createdAt,
            updatedAt: updateData.updatedAt,
        }
        return successResponses.responseMessage(res, 200, "Product successfully updated!", object)

    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}

const updateImages = async (req, res) => {
    try {
        if (!req.params.imageId) {
            return errorResponse.validationError(res, 'params', 'image id is missing in params parameters.', 'Params')
        }
        try {
            var imageId = cryptr.decrypt(req.params.imageId)
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'invalid image id provided.')
        }

        const image = await productImage.findByPk(imageId)
        if (!image) {
            return errorResponse.notFoundError(res, 'images not found in records')
        }
        const file = req.files[0]
        const existingImagePath = `${process.env.imageUploadPath}/${image.productImages}`;
        if (fs.existsSync(existingImagePath)) {
            fs.unlinkSync(existingImagePath);
        }

        if (file.length > 1) {
            return errorResponse.validationError(res, 'image', "Please upload a single image");
        }

        const arrayOfAllowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!arrayOfAllowedFileTypes.includes(file.mimetype)) {
            return errorResponse.validationError(res, 'image', "Please upload jpg, png or jpeg file")
        }

        const allowedFileSize = 5;
        if ((file.size / (1024 * 1024)) > allowedFileSize) {

            return errorResponse.validationError(res, 'image', "Files or Photos can't be morethan 5 mb")
        }

        req.body.productImages = file.filename
        await productImage.update(req.body, { where: { id: imageId } })

        const imageUrl = `${process.env.url}${req.body.productImages}`
        const imageEncryptedId = cryptr.encrypt(imageId)
        const data = {
            imageId: imageEncryptedId,
            productImage: imageUrl
        }
        return successResponses.responseMessage(res, 200, "Image successfully updated!", data)

    } catch (error) {
        return errorResponse.catchErrorMessage(res, error)
    }
}

const deleteProduct = async (req, res) => {
    try {
        if (!req.params.productId) {
            return errorResponse.validationError(res, 'params', 'product id is missing in params parameters.', 'Params')
        }
        try {
            var productId = cryptr.decrypt(req.params.productId)
        } catch (error) {
            return errorResponse.catchErrorMessage(res, error, 'invalid product id provided.')
        }

        const findProducts = await product.findByPk(productId)
        if (!findProducts) {
            return errorResponse.notFoundError(res, 'Your requested product not found')
        }
        const image = await productImage.findAll({ where: { ProductId: productId } })
        for (const images of image) {
            const existingImagePath = `${process.env.imageUploadPath}/${images.productImages}`;
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath);
            }
        }

        await productImage.destroy({ where: { ProductId: productId } })

        await product.destroy({ where: { id: productId } })

        return successResponses.responseMessage(res, 200, "Product and associated images deleted successfully.")

    } catch (error) {

        return errorResponse.catchErrorMessage(res, error)
    }
}
module.exports = {
    addProduct,
    getProduct,
    updateProduct,
    updateImages,
    deleteProduct
}