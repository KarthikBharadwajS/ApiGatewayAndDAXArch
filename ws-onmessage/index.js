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

exports.handler = async function (event, context, callback) {
    try {
        // Connection stage
        const environment = event.stageVariables && event.stageVariables.GATEWAY_ENV;
        console.log("Environment :", environment);

        // Connection ID
        const connectionId = event.requestContext.connectionId;
        console.log("Connection ID: ", connectionId);

        // Body
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        console.log("Body :", body);

        const macId = body.msg.topic === "subscribe" ? body.msg.data.channel : null;
        console.log("macId :", macId);

        // check if DAX_ENDPOINT is set
        if (!process.env.DAX_ENDPOINT) { return failureResponse({ message: 'DAX_ENDPOINT is not set' }); }

        // check if DDB_TABLE is set
        if (!process.env.DDB_TABLE) { return failureResponse({ message: 'DDB_TABLE is not set' }); }

        console.log("Env validations successfull");
        if (macId) {
            console.log("connecting to DAX");
            // await subscribeDevice(macId, connectionId, environment.toLowerCase());
            // connect to dax cluster
            const dax = new AmazonDaxClient({ endpoints: [process.env.DAX_ENDPOINT] });

            // put item
            const params = {
                TableName: process.env.DDB_TABLE + "-" + environment.toLowerCase(),
                Item: {
                    mac_id: macId,
                    connection_id: connectionId
                }
            };
            console.log("params :", params);

            const ddb = new AWS.DynamoDB.DocumentClient({ service: dax });
            const data = await ddb.put(params).promise().catch(error => {
                console.log("Error while put", error);
            });

            console.log(data);
        } else {
            console.log("channel id is not present");
        }

        return successResponse({ message: "ok" });
    } catch (error) {
        console.log("Error :", error);
        return failureResponse({ message: error.message });
    }
};