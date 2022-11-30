## DynamoDB JavaScript DocumentClient cheat sheet

The DynamoDB Document Client is the easiest and most preferred way to interact with a DynamoDB database from a Nodejs or JavaScript application.

This cheat sheet will help you get up and running quickly building applications with DynamoDB in a Nodejs or JavaScript environment.

This is meant to be a concise version of the full documentation located [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html) to help you get productive as quickly as possible.

For more great DynamoDB resources, check out the [DynamoDB Guide](https://www.dynamodbguide.com/).

## Getting started - Prerequisites

1. Make sure you have the [Node.js 18.x](https://nodejs.org/en/) installed

2. Also you need to install `aws-cli` version 2 for your operating system. See the guide [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions). 

3. Make sure you have the `aws-sdk` JavaScript SDK installed or available in the environment. If you are using AWS Lambda, this should already be available.

```sh
npm install aws-sdk
```

4. You need a text editor. [VS Code](https://code.visualstudio.com/) is recommended.

2. Import the SDK and create a new DynamoDB document client.

```javascript
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
```

The `AWS.DynamoDB.DocumentClient()` constructor takes an optional hash of options. For instance, if you are wanting to set the location to a different region than the main AWS configuration, you could pass it in like this:

```javascript
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' })
```

Check out the documentation for those options [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).
