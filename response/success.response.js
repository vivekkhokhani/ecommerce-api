module.exports = {
    responseMessage: (res, code, message, data ,) => {
        res.status(code).json({
            code: code,
            status: "Success",
            message: message,
            data:  data || {},
        });
    },
    paginationResponse: (res,code,message,pagination,data)=>{
        res.status(code).json({
            code: code,
            status: "Success",
            message: message,
            pagination:pagination,
            data:  data || {},
        })
    }
}