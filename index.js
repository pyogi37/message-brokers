require("dotenv").config();

const AWS = require("aws-sdk");

// Configure AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY, // Replace with your AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_KEY, // Replace with your AWS Secret Access Key
  region: "ap-south-1", // Replace with your AWS Region, e.g., 'us-east-1'
});

const sns = new AWS.SNS();
const sqs = new AWS.SQS();

// Generate the policy for the SQS queue
const generatePolicy = (queueArn, topicArn) => {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "sns.amazonaws.com",
        },
        Action: "sqs:SendMessage",
        Resource: queueArn,
        Condition: {
          ArnEquals: {
            "aws:SourceArn": topicArn,
          },
        },
      },
    ],
  });
};

// Function to receive messages from the SQS queue
const receiveMessageFromSQS = async (queueUrl) => {
  try {
    const receiveMessageParams = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 10, // Long polling
      VisibilityTimeout: 30,
    };

    const data = await sqs.receiveMessage(receiveMessageParams).promise();
    if (data.Messages && data.Messages.length > 0) {
      const message = data.Messages[0];
      console.log("Message received:", message.Body);

      // Process the message here

      // Delete the message after processing
      await deleteMessageFromSQS(queueUrl, message.ReceiptHandle);
    } else {
      console.log("No messages available in the queue.");
    }
  } catch (error) {
    console.error("Error receiving message:", error);
  }
};

// Function to delete a message from the SQS queue
const deleteMessageFromSQS = async (queueUrl, receiptHandle) => {
  try {
    const deleteParams = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    await sqs.deleteMessage(deleteParams).promise();
    console.log("Message deleted successfully.");
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

// Async function to handle the flow
async function main() {
  try {
    // Step 1: Create an SNS Topic
    const snsParams = { Name: "MyNewTopic" };
    const snsResult = await sns.createTopic(snsParams).promise();
    const topicArn = snsResult.TopicArn;
    console.log("SNS Topic created successfully:", topicArn);

    // Step 2: Create an SQS Queue
    const sqsParams = {
      QueueName: "testQueue1",
      Attributes: {
        DelaySeconds: "0",
        MessageRetentionPeriod: "86400",
      },
    };

    const sqsResult = await sqs.createQueue(sqsParams).promise();
    const queueUrl = sqsResult.QueueUrl;
    console.log("SQS Queue created successfully:", queueUrl);

    // Step 3: Get the ARN of the SQS Queue
    const queueArnResult = await sqs
      .getQueueAttributes({
        QueueUrl: queueUrl,
        AttributeNames: ["QueueArn"],
      })
      .promise();
    const queueArn = queueArnResult.Attributes.QueueArn;
    console.log("Queue ARN:", queueArn);

    // Step 4: Set the Queue Policy
    const policy = generatePolicy(queueArn, topicArn);
    await sqs
      .setQueueAttributes({
        QueueUrl: queueUrl,
        Attributes: {
          Policy: policy,
        },
      })
      .promise();
    console.log("Policy set successfully for the queue.");

    // Step 5: Subscribe the SQS Queue to the SNS Topic
    const subscriptionParams = {
      Protocol: "sqs",
      TopicArn: topicArn,
      Endpoint: queueArn,
    };

    const subscriptionResult = await sns
      .subscribe(subscriptionParams)
      .promise();
    console.log(
      "SQS Queue subscribed to SNS topic successfully:",
      subscriptionResult.SubscriptionArn
    );

    // Step 6: Publish a Message to the SNS Topic
    const messageParams = {
      TopicArn: topicArn,
      Message: JSON.stringify({
        text: "Hello from SNS!",
        timestamp: new Date().toISOString(),
      }),
      Subject: "Test Message",
    };
    const publishResult = await sns.publish(messageParams).promise();
    console.log(
      "Message publishes to SNS topic successfully:",
      publishResult.MessageId
    );

    // Step 7: Receive and Process the Message from SQS
    console.log("Waiting to receive message from SQS...");
    await receiveMessageFromSQS(queueUrl);
  } catch (error) {
    console.error("Error in the process:", error);
  }
}

// Execute the main function
main();
