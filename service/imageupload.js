const multer = require('multer')
const errResponses = require('../response/error.response')
function createStorage(destinationPath) {
    return multer.diskStorage({
        destination: function (req,files, cb) {
            cb(null, destinationPath);
        },

        filename: function (req, files, cb) {
           
            const uniqueValue = generateUniqueValue();
            const extension = files.originalname.split('.').pop();
            const filename = `${uniqueValue}.${extension}`;
            cb(null, filename);
        }
    });
}

function generateUniqueValue() {
    let counter = 0;
    const timestamp = Date.now();
    const random = Math.random() * 1E9;
    const uniqueValue = `${timestamp}-${random}-${counter}`;
    counter++;
    return uniqueValue;
}

const productStorage = createStorage('./public/images/product');
const userProfileStorage = createStorage('./public/images');

const productUpload = multer({ storage: productStorage });
const userProfile = multer({ storage: userProfileStorage });


module.exports = {
    productUpload,
    userProfile
}