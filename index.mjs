import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export const handler = async (event) => {

    const client = new S3Client();
    const clientDB = new DynamoDBClient();
    const clientSNS = new SNSClient();
    const clientSQS = new SQSClient();
    const commandHead = new HeadObjectCommand({
        Bucket: "ladamik-upskill",
        Key: "test.jpg"
    });

    const commandGet = new GetObjectCommand({
        Bucket: "ladamik-upskill",
        Key: "test.jpg"
    });

    var responseLambda = '';
    try {
        const responseHead = await client.send(commandHead);
        const responseGet = await client.send(commandGet);

        const commandPut = new PutObjectCommand({
            Bucket: "ladamik-upskill",
            Key: "testCopy.jpg"
        });

        const responsePut = await client.send(commandPut);

        const input = {
            "RequestItems": {
                "ladamik-upskill": [
                    {
                        "PutRequest": {
                            "Item": {
                                "name": {
                                    "S": "test"
                                },
                                "extension": {
                                    "S": "jpg"
                                }
                            }
                        }
                    }
                ]
            }
        }

        const commandDB = new BatchWriteItemCommand(input);
        await clientDB.send(commandDB);
    
        const inputSNS = {
            TopicArn: "arn:aws:sns:eu-north-1:890769921003:ladamik-upskill",
            Message: "test message",
        };
        
        const commandSNS = new PublishCommand(inputSNS);
        //const responseSNS = await clientSNS.send(commandSNS);

        const inputSQS = {
            QueueUrl: "https://sqs.eu-north-1.amazonaws.com/890769921003/ladamik-upskill",
            MessageBody: "test"
        };

        const commandSQS = new SendMessageCommand(inputSQS);
        const responseSQS = await clientSQS.send(commandSQS);
        
        
        responseLambda = {
            statusCode: 200,
            body: JSON.stringify("Ok"),
        };
    } catch (err) {
        responseLambda = {
            statusCode: 400,
            body: JSON.stringify("Error lambda:" + err),
        };
    }
    return responseLambda
}