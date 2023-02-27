// Imports section
const AWS = require('aws-sdk');

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

exports.handler = async function (event, context) {
    try {
        const endpoint = `${event.requestContext.domainName}/${event.requestContext.stage}`;
        const connectionId = event.requestContext.connectionId;

        const apigwManagementApi = new AWS.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: endpoint
        });

        const postParams = {
            ConnectionId: connectionId,
            Data: JSON.stringify({ message: "pong" })
        };

        try {
            await apigwManagementApi.postToConnection(postParams).promise();
            return successResponse({ message: "success" });
        } catch (err) {
            // console.log("Error :", err);
            return failureResponse({ message: "err" });
        }

    } catch (error) {
        // console.log("Uncaught error :", error);
        return failureResponse({ message: error.message });
    }
};