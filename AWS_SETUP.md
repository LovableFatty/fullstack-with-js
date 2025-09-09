# AWS Integration Setup Guide

This guide will help you set up AWS services for the full-stack project management application.

## 🆓 AWS Free Tier Resources

### What's Available for Free:
- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- **RDS**: 750 hours of db.t2.micro, 20GB storage
- **Lambda**: 1M requests, 400,000 GB-seconds compute
- **API Gateway**: 1M API calls
- **CloudWatch**: 10 custom metrics, 5GB log ingestion
- **IAM**: Free (always)

## 📋 Prerequisites

1. **AWS Account** - Create at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI** - Install from [aws.amazon.com/cli](https://aws.amazon.com/cli)

## 🚀 Step-by-Step Setup

### 1. Create AWS Account & IAM User

1. **Sign up for AWS** (if you don't have an account)
2. **Create IAM User**:
   - Go to IAM Console → Users → Create User
   - Username: `fullstack-project-user`
   - Attach policies: `AmazonS3FullAccess`, `CloudWatchLogsFullAccess`
   - Create access key (programmatic access)
   - **Save the Access Key ID and Secret Access Key**

### 2. Create S3 Bucket

```bash
# Install AWS CLI (if not installed)
# Windows: Download from AWS website
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: us-east-2
# Default output format: json

# Create S3 bucket
aws s3 mb s3://your-unique-bucket-name-here

# Configure bucket for public read access (required for image display)
# Create a bucket policy file
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-unique-bucket-name-here/*"
    }
  ]
}
EOF

# Apply the bucket policy
aws s3api put-bucket-policy --bucket your-unique-bucket-name-here --policy file://bucket-policy.json

# Disable block public access (required for public read)
aws s3api put-public-access-block --bucket your-unique-bucket-name-here --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### 3. Set Up Environment Variables

Copy your `.env` file and add AWS credentials:

```env
# Database connection string
DATABASE_URL="postgresql://app:app@localhost:5432/app?schema=public"

# Authentication
AUTH_SECRET="your-secret-key-here-replace-with-something-secure"
GITHUB_ID=""
GITHUB_SECRET=""

# AWS Configuration
AWS_REGION="us-east-2"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
S3_BUCKET_NAME="your-unique-bucket-name-here"
```

### 4. Test the Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔧 AWS Services Used

### S3 (Simple Storage Service)
- **Purpose**: Store project images and file attachments
- **Free Tier**: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- **Usage**: Project images, document uploads

### CloudWatch Logs
- **Purpose**: Centralized logging and monitoring
- **Free Tier**: 5GB log ingestion, 10 custom metrics
- **Usage**: Application logs, error tracking

### IAM (Identity and Access Management)
- **Purpose**: Secure access to AWS services
- **Free Tier**: Always free
- **Usage**: User permissions, API access

## 📁 File Structure

```
src/
├── server/
│   ├── aws.ts          # AWS client configuration
│   ├── s3.ts           # S3 file upload service
│   ├── cloudwatch.ts   # CloudWatch logging service
│   └── logger.ts       # Updated logger using CloudWatch
└── app/
    └── api/
        └── upload/
            └── route.ts # File upload API endpoint
```

## 🧪 Testing the Integration

### 1. Test File Upload
```bash
# Test the upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -F "file=@path/to/your/image.jpg"
```

### 2. Check CloudWatch Logs
1. Go to AWS Console → CloudWatch → Logs
2. Find log group: `/aws/fullstack-project`
3. View application logs

### 3. Verify S3 Files
1. Go to AWS Console → S3
2. Open your bucket
3. Check `project-images/` folder for uploaded files

## 🔒 Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use IAM roles** in production (not access keys)
3. **Enable S3 bucket versioning** for important files
4. **Set up CloudTrail** for API call logging
5. **Use least privilege principle** for IAM policies

## 🚨 Troubleshooting

### Common Issues:

1. **"Access Denied" errors**:
   - Check IAM user permissions
   - Verify bucket name and region

2. **"Bucket does not exist"**:
   - Ensure bucket name is correct
   - Check AWS region

3. **"Invalid credentials"**:
   - Verify Access Key ID and Secret Access Key
   - Check AWS CLI configuration

### Debug Commands:
```bash
# Test AWS CLI
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Check CloudWatch log groups
aws logs describe-log-groups
```

## 📊 Cost Monitoring

- **Set up billing alerts** in AWS Console
- **Monitor usage** in AWS Cost Explorer
- **Review free tier usage** monthly

## 🎯 Next Steps

1. **RDS Migration**: Move database to AWS RDS
2. **API Gateway**: Add REST API management
3. **Lambda Functions**: Serverless API endpoints
4. **CloudFront**: CDN for static assets

## 📚 Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudWatch Logs](https://docs.aws.amazon.com/cloudwatch/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
