// Imports section
const AmazonDaxClient = require('amazon-dax-client');
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
    // return successResponse({ message: process.env.DAX_ENDPOINT });
    try {

        // Connection stage
        const environment = event.stageVariables && event.stageVariables.GATEWAY_ENV.toLowerCase();

        // check if DAX_ENDPOINT is set
        if (!process.env.DAX_ENDPOINT) { return failureResponse({ message: 'DAX_ENDPOINT is not set' }); };

        // connect to dax cluster
        const dax = new AmazonDaxClient({ endpoints: [process.env.DAX_ENDPOINT] });

        // query items
        const params = {
            TableName: process.env.DDB_TABLE + "-" + environment,
            ExpressionAttributeNames: { "#kn0": "connection_id" },
            ExpressionAttributeValues: { ":kv0": event.requestContext.connectionId, },
            IndexName: "connection_id-index",
            KeyConditionExpression: "#kn0 = :kv0",
            Limit: 2
        };

        const ddb = new AWS.DynamoDB.DocumentClient({ service: dax });

        const screens = await ddb.query(params).promise().catch(error => {
            console.log("Error :", error);
            return successResponse({ message: "Removed from live screen list" });
        });
        console.log("Screens :", screens);
        if (screens && screens.Items && screens.Items.length > 0) {
            console.log("Screens :", screens.Items);

            // Delete single item
            const deleteParams = {
                TableName: process.env.DDB_TABLE + "-" + environment,
                Key: {
                    mac_id: screens.Items[0].mac_id
                },
            };

            await ddb.delete(deleteParams).promise()
                .then(data => {
                    console.log("Deleted screen :", data);
                    return successResponse({ message: "Removed from live screen list" });
                })
                .catch(error => {
                    console.log("Error :", error);
                    return successResponse({ message: "Removed from live screen list" });
                });

        }
    } catch (error) {
        return failureResponse({ message: error.message });
    }
};