const db = require("../model/db");
const user = db.user;
const product = db.product;
const productImage = db.productImage;
const bcrypt = require("bcrypt");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.EncryptDataKey, { saltLength: 10 });
const jwt = require("jsonwebtoken");
const fs = require('fs')
const op = db.Sequelize.Op;
const errResponses = require("../response/error.response");
const successResponses = require("../response/success.response");
const cities = db.cities;
const states = db.states;
// register as buyer|| seller

const register = async (req, res) => {
    try {
        if (req.body.role == "" || typeof req.body.role == "undefined") {
            return errResponses.validationError(res, "role");
        }
        const registerUser = ["seller", "buyer"];
        if (!registerUser.includes(req.body.role)) {
            return errResponses.validationError(res, "role", "Please select buyer or seller");
        }

        if (req.body.firstName == "" || typeof req.body.firstName == "undefined") {
            return errResponses.validationError(res, "firstName");
        }

        if (!req.body.firstName.match("^[A-Za-z][A-Za-z0-9]{0,29}$")) {
            return errResponses.validationError(
                res,
                "firstName",
                "Please enter valid firstName"
            );
        }

        if (req.body.lastName == "" || typeof req.body.lastName == "undefined") {
            return errResponses.validationError(res, "lastName");
        }

        if (!req.body.lastName.match("^[A-Za-z][A-Za-z0-9]{0,29}$")) {
            return errResponses.validationError(res, "lastName", "Please enter valid firstName");
        }
        if (req.body.email) {
            const emailCheck = await user.findOne({
                where: { email: req.body.email },
            });
            if (emailCheck) {
                return errResponses.validationError(res, "emailId", "Your email id already use");
            }
        }

        if (req.body.mobileNumber) {
            const MobileCheck = await user.findOne({
                where: { mobileNumber: req.body.mobileNumber },
            });
            if (MobileCheck) {
                return errResponses.validationError(res, "mobileNumber", "Your mobileNumber already use");
            }
        }

        if (req.body.faceBookId) {
            const faceBookIdCheck = await user.findOne({
                where: { faceBookId: req.body.faceBookId },
            });
            if (faceBookIdCheck) {
                return errResponses.validationError(res, "facebookId", "Your facebook id already use");

            }
        }
        const mobileNumber = req.body.mobileNumber || 'null'
        if (req.body.email || req.body.mobileNumber || req.body.faceBookId) {
            if (req.body.email) {
                var email = req.body.email.match("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
                if (!email) {
                    return errResponses.validationError(res, "emailId", "Please enter valid email id");
                }
            }
            if (req.body.mobileNumber) {
                const final_number = req.body.mobileNumber.replaceAll(" ", "");
                req.body.mobileNumber = final_number.match("^[7-9][0-9]{9}$");

                if (!req.body.mobileNumber) {
                    return errResponses.validationError(res, "mobileNumber", "Please enter valid mobile number");

                }
            }
            if (req.body.faceBookId) {
                var validId = req.body.FacebookId.match("^[A-Za-z][A-Za-z0-9]{0,29}$");
                if (!validId) {
                    return errResponses.validationError(res, "faceBookId", "Please enter valid faceBook id");

                }
            }
        } else {
            message = "sign up using emailid or mobilenumber or facebookid";
            return errResponses.validationError(res, "", message);
        }
        if (req.body.password == "" || typeof req.body.password == "undefined") {
            return errResponses.validationError(res, "password");
        }

        if (!req.body.password.match(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        )
        ) {
            message = "Password have at least one upper case letter, one lower case letter,one number, and one special character";
            return errResponses.validationError(res, "password", message);
        }

        if (req.body.city == "" || typeof req.body.city == "undefined") {
            return errResponses.validationError(res, "city");
        }

        try {
            var cityId = cryptr.decrypt(req.body.city);
        } catch (error) {
            return errResponses.catchErrorMessage(res, error, "Sorry, but the city you selected is invalid. Please choose a valid city.");

        }

        try {
            var stateId = cryptr.decrypt(req.body.state);
        } catch (error) {
            return errResponses.catchErrorMessage(res, error, "Sorry, but the state you selected is invalid. Please choose a valid state.");

        }

        req.body.CityId = cityId;
        req.body.StateId = stateId;

        if (req.files == "" || req.files.length > 1) {
            return errResponses.validationError(res, 'image', "Please upload a single image");
        }

        const file = req.files[0]
        //file size calculate
        const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        for (let i = 0; i < req.files.length; i++) {
            if (!allowedFileTypes.includes(req.files[i].mimetype)) {

                return errResponses.validationError(res, 'images', "please upload jpg , png or jpeg file")
            }
        }


        const allowedFileSize = 5;
        if (file.size / (1024 * 1024) > allowedFileSize) {
            return errResponses.validationError(res, "image", "Files or Photos can't be morethan 5 mb");
        }
        const shopNumber = req.body.shopContectNumber

        // for seller registration

        if (req.body.role == "seller") {

            if (
                req.body.shopAddress == "" ||
                typeof req.body.shopAddress == "undefined"
            ) {
                return errResponses.validationError(res, "shopAddress");
            }

            if (
                req.body.shopContectNumber == "" ||
                typeof req.body.shopContectNumber == "undefined"
            ) {
                return errResponses.validationError(res, "shopContectNumber");
            }
            if (req.body.shopContectNumber) {
                const shopeNumberCheck = await user.findOne({
                    where: { shopContectNumber: req.body.shopContectNumber },
                });
                if (shopeNumberCheck) {
                    return errResponses.validationError(res, "shopContectNumber", "Your enter shop contect number already use");
                }
            }
            //check shopcontectnumber
            req.body.shopContectNumber =
                req.body.shopContectNumber.match("^[7-9][0-9]{9}$");

            if (!req.body.shopContectNumber) {
                return errResponses.validationError(res, "shopContectNumber", "Please enter valid shop contect number");
            }
        }

        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.image = file.filename;
        const data = await user.create(req.body);

        const cipherText = cryptr.encrypt(data.id);

        var token = jwt.sign({ id: data.id }, process.env.jwtkey);

        //image url
        const url = `${process.env.url}${req.body.image}`;
        console.log(req.body.shopContectNumber);
        var object = {
            registerAs: data.role,
            id: cipherText,
            firstName: data.firstName,
            lastName: data.lastName,
            image: url,
            faceBookId: data.faceBookId,
            mobileNumber: mobileNumber,
            email: data.email,
            shopContectNumber: shopNumber,
            userToken: token,
        };
        return successResponses.responseMessage(res, 201, "Account create successfully", object
        );
    } catch (error) {
        return errResponses.catchErrorMessage(res, error);
    }
};

// login
const signin = async (req, res) => {
    try {
        if (req.body.mobileNumber) {
            const final_number = req.body.mobileNumber.replaceAll(" ", "");
            req.body.mobileNumber = final_number.match("^[7-9][0-9]{9}$");

            if (!req.body.mobileNumber) {
                return errResponses.validationError(res, "mobileNumber", "Please enter valid mobile number");
            }
        }
        let users = null;
        if (req.body.email) {
            users = await user.findOne({
                where: { email: req.body.email },
            });
        } else if (req.body.mobileNumber) {
            users = await user.findOne({
                where: { mobileNumber: req.body.mobileNumber },
            });
        } else if (req.body.faceBookId) {
            users = await user.findOne({
                where: { faceBookId: req.body.faceBookId },
            });
        }

        if (!users) {
            return errResponses.validationError(res, "", "The requested user was not found.");
        }

        const checkPassword = await bcrypt.compare(
            req.body.password,
            users.password
        );

        if (!checkPassword) {
            return errResponses.validationError(res, "password", "Please enter valid password");
        }

        var token = jwt.sign({ id: users.id }, process.env.jwtkey);
        const encryptId = cryptr.encrypt(users.id);


        var object = {
            registerAs: users.role,
            id: encryptId,
            firstName: users.firstName,
            lastName: users.lastName,
            faceBookId: users.faceBookId,
            mobileNumber: users.mobileNumber,
            email: users.email,
            shopNumber:users.shopContectNumber,
            shopAddress: users.shopAddress,
            token
        };

        return successResponses.responseMessage(res, 200, "Login successful!", object);

    } catch (error) {
        return errResponses.catchErrorMessage(res, error)
    }
};

// userdetail using jwt

const userDetail = async (req, res) => {
    try {
        const data = await user.findByPk(req.userId);
        if (!data) {
            return errResponses.notFoundError(res, "The requested user was not found.");
        }
        const encryptId = cryptr.encrypt(data.id);
        var object = {
            registerAs: data.role,
            id: encryptId,
            firstName: data.firstName,
            lastName: data.lastName,
            faceBookId: data.faceBookId,
            mobileNumber:data.mobileNumber,
            email: data.email,
            shopNumber:data.shopContectNumber,
            shopAddress: data.shopAddress,
        };


        return successResponses.responseMessage(res, 200, "Here is the complete set of users data", object);

    } catch (error) {
        return errResponses.catchErrorMessage(res, error);
    }
};
const getAllUser = async (req, res) => {
    try {
        var start = req.query.startDate;
        var end = req.query.endDate;

        if (!req.query.startDate) {
            start = "2000-01-01";
        }
        if (!req.query.endDate) {
            parseEndDate = new Date();
        } else {
            parseEndDate = new Date(`${end}T23:59:59Z`);
        }

        const parseStartDate = new Date(`${start}T00:00:00Z`);

        if (isNaN(parseStartDate)) {
            return errResponses.validationError(res, 'startDate', "Select valid date", 'queryparams');
        }

        if (isNaN(parseEndDate)) {
            return errResponses.validationError(res, 'endDate', "Select valid date", 'queryparams');

        }

        let searchTerm = req.query.search || '';
        if (req.query.page) {
            if (!req.query.page.match('^[0-9]*$')) {
                return errResponses.validationError(res, 'page', 'Please enter valid page number')
            }
            var page = req.query.page;
        }

        if (page <= 0 || !page) {
            page = 1;
        }
        if (req.query.size) {
            if (!req.query.size.match('^[0-9]*$')) {
                return errResponses.validationError(res, 'size', 'Please enter valid size')
            }
            var size = parseInt(req.query.size);
        }

        if (size <= 0 || !size) {
            size = 10;
        }

        id = (req.query.order == 0) ? ['id', 'DESC'] : ['id', 'ASC'];

        console.log("-----------------------------------------------------");

        var { count, rows: users } = await user.findAndCountAll({

            offset: (page - 1) * size,
            group: ['id'],
            // subQuery: false,
            where: {
                createdAt: {
                    [op.between]: [parseStartDate, parseEndDate],
                },

                [op.or]: [
                    { '$User.firstName$': { [op.like]: '%' + searchTerm + '%' } },
                    { '$User.lastName$': { [op.like]: '%' + searchTerm + '%' } },
                    { '$User.email$': { [op.like]: '%' + searchTerm + '%' } },
                    { '$city.cities$': { [op.like]: '%' + searchTerm + '%' } },
                    { '$userState.state$': { [op.like]: '%' + searchTerm + '%' } },
                    { '$products.productName$': { [op.like]: '%' + searchTerm + '%' } },
                ]
            },
            include: [
                {
                    // separate:true,
                    model: product,
                    as: 'products',
                    // attributes: ['productName', 'productPrice', 'manufacturer', 'description'],
                    required: false,
                    duplicating: false,
                },
                {
                    model: cities,
                    as: 'city',
                    attributes: ['cities'],
                    required: false,
                },
                {
                    model: states,
                    as: 'userState',
                    attributes: ["state"],
                    required: false,
                },
                // { all: true, nested: true }
            ],
            limit: size,
            attributes: {

                exclude: ["password", "role"],
            },
            order: [id],

        })
        console.log("-----------------------------------------------------");

        for (const user of users) {
            const products = await product.findAll({
                where: { userId: user.id },
                attributes: ['productName', 'productPrice', 'manufacturer', 'description'],
            });
            for (const el of products) {
                el.dataValues.productPrice = parseFloat(el.dataValues.productPrice)
            }
            user.dataValues.products = products;
        }

        users.map((el) => {
            el.dataValues.address = {
                city: el.city.cities,
                state: el.userState.state,
            };

            el.dataValues.id = cryptr.encrypt(el.dataValues.id);
            el.dataValues.image = `${process.env.url}${el.dataValues.image}`;
            el.dataValues.mobileNumber = el.mobileNumber
            el.dataValues.shopContectNumber = el.shopContectNumber

            delete el.dataValues.city;
            delete el.dataValues.userState;
            delete el.dataValues.CityId;
            delete el.dataValues.StateId;

        });
        var totalUserCount = await user.count()
        var totalPage = Math.ceil(totalUserCount / size);

        if (users == '') {
            return errResponses.notFoundError(res, "data not found");
        }

        if (searchTerm) {
            totalUserCount = count.length
            totalPage = Math.ceil(totalUserCount / size);
        }
        
        var pagination = {
            previousPage: page > 1 ? page - 1 : parseInt(page),
            curruntPage: parseInt(page),
            nextPage: page < totalPage ? parseInt(page) + 1 : parseInt(page),
            totalPageData: users.length,
            totalUserecords: totalUserCount,
            totalPage: totalPage || 1
        };

        return successResponses.paginationResponse(res, 200, "Here is the complete set of all users data", pagination, users);

    } catch (error) {
        return errResponses.catchErrorMessage(res, error);
    }
};

const updateUser = async (req, res) => {
    try {
        if (!req.params.userId) {
            return errResponses.validationError(res, "params", "User id is missing in params parameters.", "Params");
        }

        try {
            var userId = cryptr.decrypt(req.params.userId);
        } catch (error) {
            return errResponses.catchErrorMessage(res, error, "invalid user id provided.");

        }

        const users = await user.findByPk(userId);

        if (!users) {
            return errResponses.notFoundError(res, "The requested user was not found.");

        }
        if (req.files.length > 1) {
            return errResponses.validationError(res, 'image', "Please upload a single image");
        }
        if (req.files[0]) {
            req.body.image = req.files[0].filename;
            const arrayOfAllowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!arrayOfAllowedFileTypes.includes(req.files[0].mimetype)) {
                message = "please upload jpg , png or jpeg file";
                return errResponses.validationError(res, "password", message);
            }

            const allowedFileSize = 5;
            if (req.files.size / (1024 * 1024) > allowedFileSize) {
                return errResponses.validationError(res, "image", "File or Photo can't be morethan 5 mb");
            }
            const existingImagePath = `${process.env.userImage}/${users.image}`;
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath);
            }
        } else {
            req.body.image = users.image;
        }

        //update user data

        await user.update(req.body, { where: { id: userId }, });

        const userData = await user.findByPk(userId);
        const encryptedId = cryptr.encrypt(userData.id);

        if (req.files) {
            var url = `${process.env.url}${req.body.image}`;
        } else {
            var url = `${process.env.url}${userData.image}`;
        }

        var object =
        {
            registerAs: userData.role,
            id: encryptedId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            faceBookId: userData.faceBookId,
            image: url,
            mobileNumber: userData.mobileNumber,
            email: userData.email,
            shopNumber: userData.shopContectNumber,
            shopAddress: userData.shopAddress,
        }

        return successResponses.responseMessage(res, 200, "Data successfully updated!", object);

    } catch (error) {
        return errResponses.catchErrorMessage(res, error);
    }
};

const deleteData = async (req, res) => {
    try {
        if (!req.params.userId) {
            return errResponses.validationError(res, "params", "User ID is missing in params parameters.", "Params");
        }
        try {
            var originalId = cryptr.decrypt(req.params.userId);
        } catch (error) {
            return errResponses.catchErrorMessage(res, error, "Your user id is invalid.");
        }

        const users = await user.findByPk(originalId);

        if (!users) {
            return errResponses.notFoundError(res, "The requested user was not found.");
        }
        if (users.role == "seller") {
            const products = await product.findOne({ where: { UserId: originalId } });
            if (products) {
                await productImage.destroy({ where: { ProductId: products.id } });
                await product.destroy({ where: { UserId: originalId } });
            }

        }

        await user.destroy({ where: { id: originalId } });

        return successResponses.responseMessage(res, 200, "All data deleted successfully.");

    } catch (error) {
        return errResponses.catchErrorMessage(res, error);
    }
};

module.exports = {
    register,
    signin,
    userDetail,
    updateUser,
    deleteData,
    getAllUser,
};
