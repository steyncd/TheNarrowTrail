# Backend Scripts

This directory contains utility scripts for backend development, deployment, and maintenance.

## Deployment Scripts

### `deploy-to-cloud-run-updated.ps1`
Deploys the backend to Google Cloud Run with updated configuration including weather API secrets.

**Usage**: `powershell.exe -ExecutionPolicy Bypass -File deploy-to-cloud-run-updated.ps1`

### `deploy-to-cloud-run.ps1`
Original Cloud Run deployment script (legacy).

## Database Scripts

### Migration Scripts
- `run-021-migration.js` - Migration 021
- `run-024-migration.ps1` - Migration 024 (PowerShell wrapper)
- `run-025-migration.js` - Migration 025
- `run-025-migration.ps1` - Migration 025 (PowerShell wrapper)
- `run-026-migration.js` - Migration 026
- `run-migration-022.js` - Migration 022

### Database Management
- `migrate-prod-to-local.ps1` - Migrate production database to local environment
- `migrate-prod-to-local-docker.ps1` - Migrate production database to local Docker environment
- `migrate-simple.ps1` - Simplified migration script
- `get-schema.js` - Extract database schema

### Diagnostic Scripts
- `check-admin-permissions.js` - Verify admin user permissions
- `check-user-permissions.js` - Check specific user permissions
- `check-database-status.js` - Verify database connection and status
- `debug-db.js` - Database debugging utility

### Permission Management
- `run-fix-admin-permissions.ps1` - Fix admin user permissions

## API Testing

### `quick-api-test.ps1`
Quick API endpoint testing script.

## Configuration

### `create-weather-api-secrets.ps1`
Creates and configures weather API secrets in Google Cloud Secret Manager.

**Usage**: `powershell.exe -ExecutionPolicy Bypass -File create-weather-api-secrets.ps1`

## Usage Notes

- PowerShell scripts (.ps1) should be run with execution policy bypass
- Node.js scripts (.js) should be run with `node script-name.js`
- Always backup database before running migrations
- Test scripts in development environment first
- Check environment variables are properly configured

## Environment Requirements

- Node.js 18+
- PostgreSQL 16+
- Google Cloud SDK (for deployment scripts)
- PowerShell 7+ (for .ps1 scripts on non-Windows)

## Common Tasks

### Run a migration
```bash
node run-026-migration.js
```

### Deploy to production
```powershell
powershell.exe -ExecutionPolicy Bypass -File deploy-to-cloud-run-updated.ps1
```

### Check database status
```bash
node check-database-status.js
```

### Migrate production to local
```powershell
powershell.exe -ExecutionPolicy Bypass -File migrate-prod-to-local.ps1
```
