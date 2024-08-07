# AWSLambda-GenerateDB

## Description
Lambda function which makes a one time call to an API service and populates stock ticker price info for the past year into a DynamoDB on AWS.

## Installation

Compress 'node_modules' and 'index.mjs' to a zip file. This can be done through the CLI, and it's easy to do this from the File Explorer on a Windows machine. This zip file can then be uploaded to the Lambda code editor in your AWS console. Minimal Node modules are required to preserve file space, as Lambda has caps on how big a zip file is allowed. You can also work around these caps by uploading the zip file to an S3 bucket and linking within the Lambda code editor, which will increase the max file size from 50MB zipped/250MB unzipped. I did not test this as I was able to reduce the file size enough to just upload directly in the Lambda code editor.

## Usage

Built for usage with AWS Lambda, DynamoDB and the FastTrackMarket API service. Requires a paid subscription to implement these services.
