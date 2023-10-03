module.exports = {
    validationError: (res, params, message, location) => {
        const errorResponse = {
            code: 400,
            status: 'Fail',
            message: 'Invalid details',
            data: {},
            err: {
                value: '',
                message: '',
                params: params,
                location: location || 'body'
            }
        };

        if (message) {
            errorResponse.err.message = message;
        } else {
            errorResponse.err.message = `Please fill out the ${params} field.`;
        }

        return res.status(400).json(errorResponse);
    },

    catchErrorMessage: (res, error, message) => {
        res.status(400).json({
            code: '400',
            status: "Fail",
            data: {},
            err: {
                value: '',
                message: message || error.message,
                params: '',
                location: ''
            }
        })
    },
    notFoundError: (res, message) => {
        res.status(404).json({
            code: 404,
            status: 'Fail',
            message: 'Invalid details',
            data: {},
            err: {
                value: '',
                message: message,
                params: '',
                location: ''
            }
        })
    }

};



