import * as cdk from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // s3 bucket that holds frontend build files
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

  }
}
