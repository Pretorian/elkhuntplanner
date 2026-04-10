# 🚀 Quick Start: Deploy to AWS

## Fastest Option: AWS Amplify (5 minutes)

### Prerequisites:
- AWS Account
- GitHub repository with this code

### Steps:

1. **Go to AWS Amplify Console**
   ```
   https://console.aws.amazon.com/amplify
   ```

2. **Click "New app" → "Host web app"**

3. **Connect GitHub**
   - Authorize AWS Amplify
   - Select this repository
   - Choose branch: `main`

4. **Configure Build Settings**
   - Amplify auto-detects from `amplify.yml`
   - Click "Next"

5. **Review and Deploy**
   - Click "Save and deploy"
   - Wait 2-3 minutes

6. **Done!**
   - You'll get a URL like: `https://main.d1234abcd.amplifyapp.com`
   - Every git push will auto-deploy

### Add Custom Domain (Optional):
1. In Amplify Console → "Domain management"
2. Click "Add domain"
3. Enter your domain (e.g., `elkhuntplanner.com`)
4. Follow DNS configuration instructions
5. SSL certificate is auto-provisioned

---

## Cost-Effective Option: S3 + CloudFront (15 minutes)

### Using Terraform (Automated):

```bash
# 1. Install Terraform (if not installed)
brew install terraform  # macOS
# or download from: https://www.terraform.io/downloads

# 2. Configure AWS CLI
aws configure
# Enter: Access Key, Secret Key, Region (us-west-2)

# 3. Deploy infrastructure
cd terraform-aws
terraform init
terraform apply
# Type 'yes' when prompted

# 4. Note the outputs:
# - s3_bucket_name
# - cloudfront_id
# - website_url

# 5. Deploy your site
cd ..
npm run build

# Update deploy-to-s3.sh with your bucket name and CloudFront ID
# Then run:
./deploy-to-s3.sh
```

### Manual Setup (Step-by-step):

```bash
# 1. Create S3 bucket
BUCKET_NAME="elk-hunt-planner-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region us-west-2

# 2. Build and upload
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME

# 3. Create CloudFront distribution
# Go to: https://console.aws.amazon.com/cloudfront
# Click "Create distribution"
# Origin domain: Select your S3 bucket
# Origin access: Origin access control (OAC)
# Create new OAC → Save
# Default root object: index.html
# Create distribution

# 4. Copy CloudFront domain name
# Your site is live at: https://d1234abcdef.cloudfront.net
```

---

## Current Setup: GitHub Pages (Already Working)

You're currently on the `gh-pages` branch, which suggests you're using GitHub Pages.

**To keep using GitHub Pages:**
```bash
# Build and deploy
npm run build

# Commit and push the dist folder (if configured)
git add dist
git commit -m "Deploy"
git push origin gh-pages
```

**Pros:**
- ✅ Free
- ✅ Easy to use
- ✅ Auto HTTPS

**Cons:**
- ⚠️ Slower than AWS CloudFront CDN
- ⚠️ No advanced caching control
- ⚠️ Public repos only (for free tier)

---

## Which Should You Choose?

### Stick with **GitHub Pages** if:
- You want free hosting
- Performance is acceptable
- You don't need advanced features

### Upgrade to **AWS Amplify** if:
- You want better global performance
- You need preview environments for testing
- You want automatic deployments
- You can spend $1-5/month

### Use **S3 + CloudFront** if:
- You want the cheapest AWS option (~$0.50/month)
- You want maximum control
- You plan to add AWS services later (Lambda, API Gateway, etc.)
- You're comfortable with AWS infrastructure

---

## Next Steps After Deployment

1. **Set up monitoring**
   - CloudWatch (AWS)
   - Google Analytics

2. **Configure custom domain**
   - Buy domain (Route 53, Namecheap, etc.)
   - Configure DNS
   - Enable HTTPS

3. **Optimize performance**
   - Enable compression
   - Set cache headers
   - Add CDN edge locations

4. **Set up CI/CD**
   - Amplify: Built-in
   - S3: Use `.github/workflows/deploy-aws.yml.example`

---

## Troubleshooting

**"Access Denied" on S3:**
- Check bucket policy allows CloudFront OAC

**404 on page refresh (SPA routing):**
- Add CloudFront custom error response: 404 → 200 /index.html

**Leaflet maps not loading:**
- Check CORS headers
- Verify tile URL is HTTPS

**High costs:**
- Check CloudWatch metrics
- Set up billing alerts
- Enable CloudFront compression

---

## Support

- AWS Amplify: [Documentation](https://docs.aws.amazon.com/amplify/)
- S3 + CloudFront: See `AWS_DEPLOYMENT.md`
- Terraform: See `terraform-aws/main.tf`
