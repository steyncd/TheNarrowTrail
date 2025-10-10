# Deployment Troubleshooting Guide

## Critical Issue: ZIP Timestamp Error on Windows

### Problem
When deploying backend to Cloud Run from Windows, you may encounter:
```
ERROR: gcloud crashed (ValueError): ZIP does not support timestamps before 1980
```

### Root Causes

1. **Windows Reserved Device Names**
   - Files named `nul`, `con`, `prn`, `aux`, `com1-9`, `lpt1-9` cause tar/zip failures
   - These are Windows device names and cannot be properly archived
   - Common source: Redirected output like `command > nul` creates a file named `nul`

2. **Files with Invalid Timestamps**
   - Files with timestamps before 1980 (Unix epoch issues)
   - Can happen with Git operations or file transfers

3. **Problematic Files Created During Troubleshooting**
   - `.gcloudignore` with bad timestamps
   - `cloudbuild.yaml` with formatting issues
   - Modified `Dockerfile` that breaks Docker context

### Solution

**Before deploying, always run this check:**

```bash
cd backend

# Check for Windows device name files
find . -name "nul" -o -name "con" -o -name "prn" -o -name "aux" | xargs rm -f

# Remove any troubleshooting files
rm -f .gcloudignore cloudbuild.yaml

# Verify Dockerfile is original (should use COPY . ./ not selective copying)
cat Dockerfile

# Touch all files to update timestamps (if needed)
find . -type f -exec touch {} +
```

### Prevention

1. **Never redirect to `nul` on Windows in the backend directory**
   - ❌ BAD: `node -c controllers/*.js 2> nul`
   - ✅ GOOD: `node -c controllers/*.js 2>&1 | head -20`

2. **Don't create `.gcloudignore` manually**
   - Let gcloud handle it automatically
   - Only create if you have specific exclusion needs

3. **Keep Dockerfile simple**
   - Use `COPY . ./` not selective COPY commands
   - Let `.dockerignore` handle exclusions

4. **Before deploying:**
   ```bash
   # Quick pre-deployment check
   cd backend
   find . -name "nul" && echo "❌ Found nul file!" || echo "✅ No nul files"
   ```

## Successful Deployment Command

```powershell
cd backend

gcloud run deploy backend `
  --source . `
  --platform managed `
  --region europe-west1 `
  --allow-unauthenticated
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300 `
  --port 8080
```

## Files That Should Exist

### `.dockerignore`
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.vscode
.DS_Store
*.log
```

### `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . ./

# Cloud Run uses PORT environment variable
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

## Files That Should NOT Exist

- ❌ `nul` - Windows device name
- ❌ `con`, `prn`, `aux` - Other Windows device names
- ❌ `.gcloudignore` - Unless specifically needed
- ❌ `cloudbuild.yaml` - Unless using Cloud Build directly
- ❌ `*.tmp` - Temporary files
- ❌ `desktop.ini` - Windows system files

## Related Issues

### Container Registry Deprecated
If you see: `Container Registry is deprecated and shutting down`

Use Artifact Registry URLs instead:
- ❌ OLD: `gcr.io/helloliam/hiking-portal-api`
- ✅ NEW: `us-central1-docker.pkg.dev/helloliam/cloud-run-source-deploy/hiking-portal-api`

However, `--source .` deployment handles this automatically, so prefer that method.

## Debugging Failed Deployments

1. **Check Cloud Build logs:**
   ```bash
   gcloud builds list --limit 5
   gcloud builds log <BUILD_ID>
   ```

2. **Test Docker build locally:**
   ```bash
   cd backend
   docker build -t test-image .
   ```

3. **Verify no special files:**
   ```bash
   find . -type f -name "nul" -o -name "con" -o -name "prn"
   ```

4. **Check file timestamps:**
   ```bash
   find . -type f -printf '%T+ %p\n' | sort | head -10
   ```

## Summary

The most common issue is **`nul` files created by Windows command redirects**. Always check for and remove these before deploying:

```bash
cd backend
rm -f nul routes/nul controllers/nul
gcloud run deploy hiking-portal-api --source . --region us-central1 ...
```
