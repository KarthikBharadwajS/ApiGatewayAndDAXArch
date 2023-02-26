## Prerequisite
- aws-cli/2.10.2 Python/3.9.11
- node v18.14.1 or higher

# configure aws
`aws configure`

# create lambda function
`aws lambda create-function --function-name ws-onconnect --runtime "nodejs18.x" --role arn:aws:iam::123456789012:role/ws-access-iam-role --zip-file "fileb://dist/index.zip" --handler index.handler`

# update lambda function
`aws lambda update-function-code --function-name ws-onconnect --zip-file fileb://dist/index.zip`

#### GETTING STARTED
- Create a DynamoDB Database table
- Create a DAX Cluster in the same region as database table created, note down VPC and subnets
- If you have a separate index, make sure to provided access in IAM for that resource also for example, *resource/my-database/my_field-index
- Create 4 lambda functions for onconnect, ondisconnect and onmessage
- Create a Websocket APIGateway, and attach all the lambda functions with the respective routes
- Enable VPC for onconnect, ondisconnect and onmessage lambda and attach the DAX cluster VPC and Security group
- Add Environment Variables DAX_ENDPOINT, DDB_TABLE, AWS_ACCESS and AWS_SECRET
- Add the layers for node_modules, it has to be in nodejs/node_modules structure
- Attach the layers to the lambda function
- Lambda functions should have APIGateway and ExecutionRole permissions

#### UPDATING LAMBDA FUNCTIONS
- Make sure you have correct credentials in your .aws/credentials
- Move to the respective folder and run `npm run publish-fn`

#### UPDATING LAMBDA LAYERS
- Make sure you have correct credentials in your .aws/credentials
- Move to the respective folder and run `npm run publish-layer`