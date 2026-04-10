# AWS Deployment Guide - Elk Hunt Planner

This static React app can be deployed to AWS using multiple approaches. Choose based on your needs:

## 📊 Comparison Table

| Feature | AWS Amplify | S3 + CloudFront | GitHub Pages (Current) |
|---------|-------------|-----------------|----------------------|
| **Cost/month** | $1-5 | $0.50-2 | **Free** |
| **Setup Time** | 5 min | 15-30 min | 2 min |
| **CI/CD** | ✅ Built-in | ❌ Manual | ✅ GitHub Actions |
| **HTTPS** | ✅ Auto | ✅ Via CloudFront | ✅ Auto |
| **Custom Domain** | ✅ Easy | ✅ Manual | ✅ Easy |
| **Deploy Speed** | Fast | Very Fast | Fast |
| **Rollback** | ✅ One-click | ⚠️ Manual | ⚠️ Manual |
| **Best For** | Active dev | Production | Simple hosting |

---

## 🚀 Option 1: AWS Amplify (Recommended)

**Best for**: Easy setup, automatic deployments, active development

### Setup:
1. The `amplify.yml` config is already in your repo
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click **"New app"** → **"Host web app"**
4. Connect to your GitHub repository
5. Select branch (`main` or `gh-pages`)
6. Amplify auto-detects settings → Click **"Save and deploy"**

### Features:
- ✅ Automatic deployments on git push
- ✅ Preview URLs for pull requests
- ✅ Free SSL certificate
- ✅ Global CDN included
- ✅ One-click rollbacks
- ✅ Environment variables support
- ✅ Custom domains with one-click setup

### Cost:
- Build: $0.01/minute (typically 2-3 min/build)
- Hosting: $0.15/GB served
- **Estimate**: $1-5/month for personal use

---

## 💰 Option 2: S3 + CloudFront (Cost-Optimized)

**Best for**: Production, cost optimization, full control

### Quick Deploy Script:
```bash
# 1. Build the app
npm run build

# 2. Set up infrastructure (one-time)
cd terraform-aws
terraform init
terraform apply

# 3. Deploy using the script
chmod +x deploy-to-s3.sh
./deploy-to-s3.sh
```

### Manual Setup (without Terraform):

#### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://elk-hunt-planner-yourname --region us-west-2
```

#### Step 2: Upload Files
```bash
npm run build
aws s3 sync dist/ s3://elk-hunt-planner-yourname --delete
```

#### Step 3: Create CloudFront Distribution
1. Go to CloudFront Console
2. Create distribution:
   - Origin: Your S3 bucket
   - Origin Access: Origin Access Control (OAC)
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Compress Objects: Yes
   - Default Root Object: `index.html`
3. Add error pages:
   - 404 → `/index.html` (200) - for SPA routing
   - 403 → `/index.html` (200)

#### Step 4: Update S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::elk-hunt-planner-yourname/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### Cost:
- S3: $0.023/GB storage + $0.09/GB transfer
- CloudFront: $0.085/GB (first 10TB)
- **Estimate**: $0.50-2/month

---

## 🎯 Option 3: Terraform Deployment

The `terraform-aws/main.tf` file provides Infrastructure as Code:

```bash
cd terraform-aws
terraform init
terraform apply

# Get outputs
terraform output website_url
terraform output cloudfront_id
```

Update `deploy-to-s3.sh` with the CloudFront ID from terraform output.

---

## 🌐 Adding Custom Domain

### For Amplify:
1. In Amplify Console → Domain management
2. Add domain → Follow wizard
3. Update DNS records as instructed

### For CloudFront:
1. Request SSL cert in ACM (us-east-1 region)
2. Add domain to CloudFront distribution
3. Update Route 53 (or your DNS):
   ```
   Type: A (Alias)
   Alias Target: Your CloudFront distribution
   ```

---

## 🔄 CI/CD with GitHub Actions (for S3+CloudFront)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://elk-hunt-planner-yourname \
            --delete \
            --cache-control "public, max-age=31536000, immutable" \
            --exclude "index.html"

          aws s3 cp dist/index.html s3://elk-hunt-planner-yourname/index.html \
            --cache-control "public, max-age=0, must-revalidate"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

---

## 📝 Deployment Checklist

- [ ] Choose deployment method
- [ ] Create AWS account (if needed)
- [ ] Set up billing alerts
- [ ] Configure domain (optional)
- [ ] Test deployment
- [ ] Set up monitoring (CloudWatch)
- [ ] Configure backups (if needed)

---

## 🛡️ Security Best Practices

1. **Enable WAF** (Web Application Firewall) on CloudFront
2. **Use OAC** (Origin Access Control) instead of OAI
3. **Enable CloudFront logging**
4. **Set up CloudWatch alarms** for costs
5. **Use HTTPS only** (redirect HTTP)
6. **Enable S3 versioning** for rollback capability

---

## 💡 Recommendations

**For your use case** (hunting planner with no backend):

1. **Start with GitHub Pages** (free, already set up)
2. **Upgrade to Amplify** when you need:
   - Better performance (global CDN)
   - Preview environments
   - Professional custom domain
3. **Use S3+CloudFront** when you need:
   - Minimum cost
   - Maximum control
   - Integration with other AWS services

---

## 🆘 Troubleshooting

### SPA Routing (404 on refresh)
- Amplify: Auto-handled
- CloudFront: Add custom error responses (already in terraform config)

### CORS Issues with Maps
- Add CORS headers in CloudFront response headers policy

### Cost Optimization
- Enable CloudFront compression
- Set appropriate cache TTLs
- Use CloudFront Functions for edge logic
- Monitor with AWS Cost Explorer

---

## 📚 Resources

- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [CloudFront + S3 Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
