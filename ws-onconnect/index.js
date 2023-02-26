const AWS = require("aws-sdk");


// Response handlers
const successResponse = (body = null) => {
    return {
        statusCode: 200,
        body: JSON.stringify(body || { message: "ok" })
    };
};

const failureResponse = (body = null) => {
    return {
        statusCode: 500,
        body: JSON.stringify(body || { message: "Internal Server Error" })
    };
};

/** ON CONNECTION EVENT HANDLER */
exports.handler = async function (event, context) {
    try {
        // send success response
        return successResponse({ message: 'Connected' });
    } catch (error) {
        return failureResponse({ message: error.message });
    }
};