// Imports section
const AWS = require('aws-sdk');
const AmazonDaxClient = require('amazon-dax-client');

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
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

        // Connect to DAX cluster
        const dax = new AmazonDaxClient({ endpoints: [process.env.DAX_ENDPOINT] });

        const region = body.connection_region;
        // get item
        const params = {
            TableName: process.env.DDB_TABLE + "-" + body.environment,
            Key: { mac_id: body.mac_id }
        };

        /* const ddb = new AWS.DynamoDB.DocumentClient({ region: region, accessKeyId: process.env.AWS_ACCESS, secretAccessKey: process.env.AWS_SECRET }); */
        const ddb = new AWS.DynamoDB.DocumentClient({ service: dax });

        const data = body.connection_id ? { Item: { mac_id: body.mac_id, connection_id: body.connection_id } } : await ddb.get(params).promise().catch(err => { return failureResponse({ message: err.message }); });

        
        // if data is found
        if (data && data.Item && data.Item.connection_id) {
            const endpoint = `${body.api}.execute-api.${region}.amazonaws.com`;

            const apigwManagementApi = new AWS.ApiGatewayManagementApi({
                apiVersion: '2018-11-29',
                endpoint: endpoint + `/${body.environment === "development" ? "dev" : body.environment}`,
                region: region
            });

            const postParams = {
                ConnectionId: data.Item.connection_id,
                Data: JSON.stringify(body.message)
            };

            try {
                await apigwManagementApi.postToConnection(postParams).promise();
                return successResponse({ message: "success", connection: data.Item });
            } catch (err) {
                console.log("Error :", err);
                return failureResponse({ message: "err" });
            }
        } else {
            return failureResponse({ message: 'There is no live screen with provided mac id' });
        }
    } catch (error) {
        console.log("Uncaught error :", error);
        return failureResponse({ message: error.message });
    }
};