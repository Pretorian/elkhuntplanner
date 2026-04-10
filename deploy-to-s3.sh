#!/bin/bash

# AWS S3 + CloudFront Deployment Script
# Usage: ./deploy-to-s3.sh

# Configuration (UPDATE THESE)
BUCKET_NAME="elk-hunt-planner"
REGION="us-west-2"
CLOUDFRONT_ID="YOUR_CLOUDFRONT_DISTRIBUTION_ID"

# Build the app
echo "Building application..."
npm run build

# Sync to S3
echo "Deploying to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.map"

# Upload index.html with no caching
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*"

echo "Deployment complete!"
echo "Site URL: https://d111111abcdef.cloudfront.net"
