# 🔧 Deployment Script Consolidation Plan

## Current Situation (Problematic)

### Scripts Found Across Multiple Locations:

#### `/scripts` (Root - SHOULD BE THE ONLY LOCATION)
- ✅ deploy-all.bat - Full stack deployment (Windows)
- ✅ deploy-backend.sh - Backend only (Unix/Linux/Mac)
- ✅ deploy-backend.ps1 - Backend only (PowerShell)
- ✅ deploy-frontend.sh - Frontend only (Unix/Linux/Mac)

#### `/backend/tools` (SHOULD BE REMOVED)
- ❌ deploy.sh - Outdated, missing Secret Manager config
- ❌ deploy.bat - Outdated, missing Secret Manager config

#### `/frontend/scripts` (SHOULD BE REMOVED)
- ❌ deploy-secure.sh - Redundant, has .env.local safety checks
- ❌ deploy-secure.ps1 - Redundant, has .env.local safety checks
- ❌ deploy-secure-simple.ps1 - Redundant simplified version

## Problems Identified

1. **Multiple conflicting versions** - Same functionality in 3 different locations
2. **Outdated scripts** - `/backend/tools` scripts lack Secret Manager integration
3. **Inconsistent configuration** - Different database IPs, missing features
4. **Confusion risk** - Developers might use wrong script
5. **Maintenance burden** - Need to update multiple versions
6. **Production risk** - Old scripts could deploy with wrong config

## Solution: Single Source of Truth

### Keep Only `/scripts` Directory (Project Root)

**Rationale**: 
- Centralized location
- Easy to find
- Clear separation from code
- Version controlled with root docs

### Final Script Set

#### 1. Backend Deployment (3 versions for different platforms)
- **deploy-backend.sh** (Unix/Linux/Mac) ✅
  - Full Secret Manager integration
  - Database IP: 35.202.149.98
  - All environment variables configured
  
- **deploy-backend.ps1** (Windows PowerShell) ✅
  - Full Secret Manager integration
  - Database IP: 35.202.149.98
  - All environment variables configured
  
- **deploy-backend.bat** (Windows CMD) - CREATE NEW
  - Extract from deploy-all.bat
  - Standalone backend deployment
  - Same config as .sh and .ps1

#### 2. Frontend Deployment (2 versions + safety features)
- **deploy-frontend.sh** (Unix/Linux/Mac) ✅
  - Simple deployment
  - Should add .env.local safety checks
  
- **deploy-frontend.ps1** (Windows PowerShell) - CREATE NEW
  - Port from frontend/scripts/deploy-secure-simple.ps1
  - Include .env.local safety checks
  
- **deploy-frontend.bat** (Windows CMD) - CREATE NEW
  - Extract from deploy-all.bat
  - Include .env.local safety checks

#### 3. Full-Stack Deployment (1 version)
- **deploy-all.bat** (Windows) ✅
  - Already complete and tested
  - Calls backend + frontend in sequence

## Implementation Steps

### Phase 1: Enhance Existing Scripts ✅
1. ✅ deploy-backend.ps1 - Already updated with full config
2. ✅ deploy-backend.sh - Already has full config
3. ⚠️ deploy-frontend.sh - Needs .env.local safety checks
4. ✅ deploy-all.bat - Already complete

### Phase 2: Create Missing Scripts
1. Create deploy-backend.bat (standalone)
2. Create deploy-frontend.ps1 (with safety checks)
3. Create deploy-frontend.bat (with safety checks)

### Phase 3: Add Safety Features
1. Add .env.local detection to all frontend scripts
2. Add validation that .env.production exists
3. Add build output validation (no localhost references)
4. Add deployment confirmation prompts

### Phase 4: Remove Obsolete Scripts
1. Delete `/backend/tools/deploy.sh`
2. Delete `/backend/tools/deploy.bat`
3. Delete `/frontend/scripts/deploy-secure.sh`
4. Delete `/frontend/scripts/deploy-secure.ps1`
5. Delete `/frontend/scripts/deploy-secure-simple.ps1`

### Phase 5: Update Documentation
1. Update README.md in /scripts
2. Update backend/README.md
3. Update frontend/README.md
4. Create DEPLOYMENT.md guide in root

## Safety Features to Add

### All Frontend Scripts Must Include:
1. **Pre-deployment checks**:
   - Check for .env.local existence
   - Backup .env.local if exists
   - Temporarily move .env.local during build
   - Validate .env.production exists

2. **Build validation**:
   - Scan build output for localhost references
   - Scan build output for 127.0.0.1 references
   - Scan build output for 192.168.x.x references
   - Fail deployment if found

3. **Post-deployment**:
   - Restore .env.local after deployment
   - Clean up backup files
   - Provide clear success/failure messages

### All Backend Scripts Must Include:
1. **Pre-deployment checks**:
   - Verify all 8 Secret Manager secrets exist
   - Verify gcloud CLI is installed
   - Verify correct project is set
   - Clean up Windows artifacts (nul files)

2. **Configuration validation**:
   - Database IP: 35.202.149.98 (correct)
   - All environment variables present
   - All secrets configured
   - Service account configured

3. **Deployment confirmation**:
   - Show what will be deployed
   - Require explicit confirmation
   - Provide clear feedback during deployment

## Expected Outcomes

### After Consolidation:
- ✅ Single location for all deployment scripts
- ✅ Consistent configuration across all scripts
- ✅ No risk of using outdated scripts
- ✅ Clear documentation of what each script does
- ✅ Platform-appropriate scripts (Windows/Unix)
- ✅ Production safety checks in all scripts
- ✅ Easy to maintain and update

### Script Matrix:

| Task | Windows CMD | Windows PowerShell | Unix/Linux/Mac |
|------|-------------|-------------------|----------------|
| Deploy Backend | deploy-backend.bat | deploy-backend.ps1 ✅ | deploy-backend.sh ✅ |
| Deploy Frontend | deploy-frontend.bat | deploy-frontend.ps1 | deploy-frontend.sh ⚠️ |
| Deploy Full Stack | deploy-all.bat ✅ | - | - |

## Configuration Standards

### All Scripts Must Use:
- **Database IP**: 35.202.149.98
- **Backend URL**: https://backend-554106646136.europe-west1.run.app
- **Frontend URL**: https://helloliam.web.app
- **Project ID**: helloliam
- **Project Number**: 554106646136
- **Region**: europe-west1
- **Service Name**: backend

### Secret Manager Secrets (All 8 Required):
1. db-password
2. jwt-secret
3. sendgrid-key
4. sendgrid-from-email
5. openweather-api-key
6. twilio-sid
7. twilio-token
8. twilio-whatsapp-number

### Environment Variables (Backend):
- NODE_ENV=production
- DB_HOST=35.202.149.98
- DB_PORT=5432
- DB_NAME=hiking_portal
- DB_USER=postgres
- FRONTEND_URL=https://helloliam.web.app

### Environment Variables (Frontend):
- REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app
- REACT_APP_ENV=production

## Timeline

1. **Immediate** (This session):
   - Enhance deploy-frontend.sh with safety checks
   - Create deploy-backend.bat
   - Create deploy-frontend.ps1
   - Create deploy-frontend.bat

2. **Before Next Deployment**:
   - Delete obsolete scripts
   - Update all documentation
   - Test all scripts

3. **Ongoing**:
   - Maintain only scripts in /scripts directory
   - Update README files to point to /scripts
   - Document any configuration changes

## Success Criteria

- [ ] All deployment scripts in single location (/scripts)
- [ ] All scripts have consistent configuration
- [ ] All frontend scripts have .env.local safety checks
- [ ] All backend scripts verify Secret Manager secrets
- [ ] All obsolete scripts removed
- [ ] Documentation updated
- [ ] All scripts tested and working
- [ ] No way to accidentally deploy wrong configuration
