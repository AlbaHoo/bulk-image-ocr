# GitHub Actions CI/CD Setup for Vercel Deployment

This repository includes GitHub Actions workflows to automatically deploy your Parse OCR application to Vercel.

## Setup Instructions

### 1. Install Vercel CLI locally
```bash
npm install -g vercel
```

### 2. Link your project to Vercel
Navigate to your project directory and run:
```bash
cd client-apps/parse-ocr
vercel
```

Follow the prompts to link your project to Vercel.

### 3. Get your Vercel tokens and IDs

After linking your project, you can find your project and organization IDs:

```bash
# Get your Vercel token
vercel whoami

# View project settings
cat .vercel/project.json
```

### 4. Set up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

- `VERCEL_TOKEN`: Your Vercel token (get it from https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: Your Vercel organization ID (from `.vercel/project.json`)
- `VERCEL_PROJECT_ID`: Your Vercel project ID (from `.vercel/project.json`)

### 5. Configure Environment Variables in Vercel

In your Vercel dashboard, go to your project settings and add these environment variables:

- `REACT_APP_PARSE_SERVER_URL`: Your Parse Server URL
- `REACT_APP_PARSE_APP_ID`: Your Parse App ID
- `REACT_APP_PARSE_JAVASCRIPT_KEY`: Your Parse JavaScript Key

## Workflow Features

### Continuous Integration
- ✅ Runs tests on every push and pull request
- ✅ Builds the application to ensure it compiles
- ✅ Only deploys if tests pass

### Continuous Deployment
- 🚀 **Production Deploy**: Automatically deploys to production when pushing to `main` branch
- 🔍 **Preview Deploy**: Creates preview deployments for pull requests
- 💬 **PR Comments**: Automatically comments on PRs with preview deployment URLs

## File Structure

```
.github/
└── workflows/
    ├── ci-cd.yml      # Main CI/CD workflow
    └── deploy.yml     # Alternative comprehensive workflow
vercel.json           # Vercel configuration
```

## Workflow Triggers

- **Push to main/master**: Runs tests and deploys to production
- **Pull requests**: Runs tests and creates preview deployment
- **Path filtering**: Only triggers when files in `client-apps/parse-ocr/` change

## Environment Variables

The workflows use these environment variables:
- `VERCEL_TOKEN`: Your Vercel authentication token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## Troubleshooting

### Common Issues

1. **Build fails**: Check that your `package.json` scripts work locally
2. **Deploy fails**: Verify your Vercel tokens are correct
3. **Environment variables**: Make sure they're set in both GitHub Secrets and Vercel project settings

### Debug Steps

1. Check the Actions tab in your GitHub repository for detailed logs
2. Verify your `vercel.json` configuration
3. Test deployment locally with `vercel --prod`

## Manual Deployment

You can still deploy manually using:
```bash
cd client-apps/parse-ocr
vercel --prod
```
