import * as cdk from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { join } from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket that serves the frontend website
    const bucket = new Bucket(this, 'FAWebsiteBucket1100', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    // S3 deployment
    new BucketDeployment(this, 'FAWebsiteDeployment', {
      sources: [Source.asset('../build')],
      destinationBucket: bucket,
    });

    // Create cloudfront distribution
    const distribution = new Distribution(this, 'FADistribution', {
      defaultBehavior: { origin: new S3Origin(bucket) },
    });

    // DefineAuthChallenge lambda
    const defineAuthChallengeLambda = new NodejsFunction(this, 'FADefineAuthChallengeLambda', {
      entry: join(__dirname, `../functions/defineAuthChallenge/handler.js`),
      runtime: Runtime.NODEJS_18_X,
      handler: "handler"
    });

    // CreateAuthChallenge lambda
    const createAuthChallengeLambda = new NodejsFunction(this, 'FACreateAuthChallengeLambda', {
      entry: join(__dirname, `../functions/createAuthChallenge/handler.js`),
      runtime: Runtime.NODEJS_18_X,
      handler: "handler"
    });
    createAuthChallengeLambda

    // VerifyAuthChallengeResponse lambda
    const verifyAuthChallengeResponseLambda = new NodejsFunction(this, 'FAVerifyAuthChallengeResponseLambda', {
      entry: join(__dirname, `../functions/verifyAuthChallengeResponse/handler.js`),
      runtime: Runtime.NODEJS_18_X,
      handler: "handler"
    });

    // PreSignUp lambda
    const preSignUpLambda = new NodejsFunction(this, 'FAPreSignUpLambda', {
      entry: join(__dirname, `../functions/preSignUp/handler.js`),
      runtime: Runtime.NODEJS_18_X,
      handler: "handler"
    });

    // Cognito userpool
    const userPool = new UserPool(this, 'FAUserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        phone: true
      },
      standardAttributes: {
        phoneNumber: { required: true, mutable: true }
      },
      lambdaTriggers: {
        defineAuthChallenge: defineAuthChallengeLambda,
        createAuthChallenge: createAuthChallengeLambda,
        verifyAuthChallengeResponse: verifyAuthChallengeResponseLambda,
        preSignUp: preSignUpLambda
      }
    });

    // Cognito userpool web client
    const userPoolWebClient = userPool.addClient('FAUserPoolWebClient', {
      authFlows: { custom: true }
    });
    
  }
}
