# Environment Variables Setup

For the application to connect to AWS DynamoDB, you need to set up the following environment variables in a `.env.local` file in the root of your project:

```
# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# NextAuth Secret (used for JWT signing)
NEXTAUTH_SECRET=your_next_auth_secret
NEXTAUTH_URL=http://localhost:3000
```

Replace `your_aws_access_key_id` and `your_aws_secret_access_key` with your AWS IAM user's credentials (Devil user).

For `NEXTAUTH_SECRET`, you can generate a secure random string using:
```
openssl rand -base64 32
```
Or any other method to create a secure random string.

After creating the `.env.local` file, restart your Next.js server for the changes to take effect. 