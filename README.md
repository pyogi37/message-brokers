# SNS-SQS Integration Example

This project demonstrates how to integrate AWS Simple Notification Service (SNS) with AWS Simple Queue Service (SQS) using the AWS SDK. The script performs the following operations:

1. Creates an SNS Topic.
2. Creates an SQS Queue.
3. Sets a policy on the SQS Queue to allow messages from the SNS Topic.
4. Subscribes the SQS Queue to the SNS Topic.
5. Publishes a message to the SNS Topic.
6. Receives and processes the message from the SQS Queue.

## Prerequisites

To run this project, you must have the following:

- **AWS Account** with access to SNS and SQS services.
- **Node.js** installed on your machine.
- **AWS Access Key** and **AWS Secret Key** set up for authentication.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/sns-sqs-integration.git
   ```

2. **Navigate into the project directory**:

  ```bash
  cd sns-sqs-integration
  ```

3. **Install dependencies:**

  ```bash
  npm install
  ```

4. **Set up environment variables:**

   ```bash
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_KEY=your_aws_secret_key
    ```

## Usage

### Run the script:

You can execute the script by running the following command:

```bash
node index.js
```

### What happens:
- The script creates an SNS topic.
- Creates an SQS queue and sets a policy allowing the SNS topic to send messages to the queue.
- Subscribes the SQS queue to the SNS topic.
- Publishes a message to the SNS topic.
- Receives the message from the SQS queue, processes it, and deletes it.

### Structure:
- **index.js**: The main script that creates the SNS topic, SQS queue, subscribes the queue, and processes the messages.
- **.env**: The file where you store your AWS credentials (`AWS_ACCESS_KEY` and `AWS_SECRET_KEY`).

### IAM Permissions Required:
The IAM user or role running this script must have the following permissions:
- `sns:CreateTopic`
- `sqs:CreateQueue`
- `sqs:SetQueueAttributes`
- `sns:Subscribe`
- `sns:Publish`
- `sqs:ReceiveMessage`
- `sqs:DeleteMessage`

