# Cost Optimization Guide - Hiking Portal

## Summary of Optimizations Implemented

### ✅ Immediate Savings (Implemented)

1. **Weather API Caching** - **HIGHEST IMPACT**
   - **Savings:** 80-95% reduction in API calls
   - **Implementation:** In-memory cache with 1-hour TTL
   - **Cost Impact:** Reduces Visual Crossing calls from ~1000/day potential to <100/day
   - **Cache Stats Endpoint:** `GET /api/weather/cache/stats` (admin only)
   - **Cache Clear Endpoint:** `POST /api/weather/cache/clear` (admin only)

### 🔧 Additional Optimizations to Implement

#### 2. **Reduce Cloud Run Memory** (Easy Win)
**Current:** 512Mi  
**Recommended:** 256Mi  
**Savings:** 50% reduction in memory costs  
**Risk:** Low (Node.js apps typically use <200Mi)

```bash
# Command to update:
gcloud run services update backend \
  --region=europe-west1 \
  --memory=256Mi
```

#### 3. **Reduce Cloud Run CPU** (Medium Win)
**Current:** 1 CPU  
**Recommended:** 0.5 CPU (500 millicpu)  
**Savings:** 50% reduction in CPU costs  
**Risk:** Low (your traffic is likely low-moderate)

```bash
# Command to update:
gcloud run services update backend \
  --region=europe-west1 \
  --cpu=0.5
```

#### 4. **Set Minimum Instances to 0** (Already Set)
**Current:** 0 (scales to zero)  
**Savings:** No idle costs  
**Trade-off:** Cold start latency (~2-3 seconds first request)

#### 5. **Optimize Cloud SQL**
**Current Settings:** Verify your Cloud SQL instance size
**Recommendations:**
- Use smallest instance type for low traffic (db-f1-micro or db-g1-small)
- Enable automatic backups only (not high availability for dev/test)
- Set storage to minimum needed

```bash
# Check current instance:
gcloud sql instances describe hiking-db --format="value(settings.tier, settings.dataDiskSizeGb)"
```

#### 6. **Firebase Hosting Optimization**
**Current:** Already optimized (static hosting is very cheap)
**Additional Steps:**
- Enable CDN caching (already enabled by default)
- Compress assets (already done by build process)
- Remove unused assets from build folder

## Cost Breakdown Estimate

### Current Monthly Costs (Estimated)

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **Cloud Run** | 512Mi, 1 CPU, ~10K requests/month | $5-10 |
| **Cloud SQL** | db-f1-micro or similar | $7-15 |
| **Firebase Hosting** | <1GB bandwidth | $0-1 |
| **Weather APIs** | 1000 calls/day without cache | $0 (free tier) |
| **SendGrid** | Email notifications | $0 (free tier) |
| **Twilio** | WhatsApp messages | Pay per use |
| **TOTAL** | | **$12-26/month** |

### After Optimizations (Estimated)

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **Cloud Run** | 256Mi, 0.5 CPU, ~10K requests/month | $2-5 |
| **Cloud SQL** | Optimized | $7-12 |
| **Firebase Hosting** | <1GB bandwidth | $0-1 |
| **Weather APIs** | 100 calls/day with cache | $0 (free tier) |
| **SendGrid** | Email notifications | $0 (free tier) |
| **Twilio** | WhatsApp messages | Pay per use |
| **TOTAL** | | **$9-18/month** |

**Potential Savings: 25-40%** (~$3-8/month)

## Implementation Priority

### Priority 1: Already Implemented ✅
- [x] Weather API caching (biggest impact)

### Priority 2: Low-Risk, High-Impact (Do Next)
- [ ] Reduce Cloud Run memory to 256Mi
- [ ] Reduce Cloud Run CPU to 0.5

### Priority 3: Audit and Optimize
- [ ] Check Cloud SQL instance size
- [ ] Review database connection pooling
- [ ] Monitor actual resource usage

### Priority 4: Monitoring (Ongoing)
- [ ] Set up budget alerts in Google Cloud Console
- [ ] Monitor weather API usage on provider dashboards
- [ ] Track Cloud Run metrics (memory, CPU, requests)

## Monitoring Commands

### Check Cloud Run Resource Usage
```bash
# View metrics
gcloud run services describe backend --region=europe-west1 --format=yaml

# View logs for cache hits/misses
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backend AND textPayload=~'Weather cache'" --limit=50
```

### Check Weather API Usage
```bash
# Get cache stats via API (requires admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://backend-554106646136.europe-west1.run.app/api/weather/cache/stats
```

### Visual Crossing Usage
- Dashboard: https://www.visualcrossing.com/account
- Free limit: 1000 calls/day
- With caching: Should stay well under 100 calls/day

### WeatherAPI.com Usage
- Dashboard: https://www.weatherapi.com/my/
- Free limit: 1,000,000 calls/month
- With caching: Should use <3,000 calls/month

## Advanced Optimizations (Future)

### Database-Backed Weather Cache
Instead of in-memory cache, store in PostgreSQL:
- **Pros:** Survives container restarts, shared across instances
- **Cons:** Adds database queries
- **Implementation:** Create `weather_cache` table

### CDN for API Responses
Use Cloud CDN or Cloudflare:
- **Pros:** Cache at edge, faster response times
- **Cons:** Complexity, cache invalidation
- **Cost:** Small additional cost

### Scheduled Weather Prefetching
Pre-fetch weather for upcoming hikes:
- **Pros:** No user-facing API delays
- **Cons:** May fetch weather that's never viewed
- **Implementation:** Cloud Scheduler + cron job

## Cache Performance Metrics

The weather cache logs every hit and miss. Monitor these patterns:

**Good Patterns:**
- High cache hit rate (>80%)
- "Cleaned X expired entries" every 15 minutes
- Low number of API calls to weather providers

**Bad Patterns:**
- Low cache hit rate (<50%)
- Frequent cache misses for same location/date
- High API usage on provider dashboards

## Budget Alerts Setup

1. Go to: https://console.cloud.google.com/billing
2. Click "Budgets & alerts"
3. Create budget:
   - Name: "Hiking Portal Monthly Budget"
   - Amount: $25/month
   - Alert at: 50%, 80%, 100%
   - Email: Your email

## Free Tier Limits (Stay Under These)

### Google Cloud
- Cloud Run: 2M requests/month, 360K GB-seconds, 180K vCPU-seconds
- Cloud SQL: No free tier, but smallest instance is ~$7/month

### Weather APIs
- Visual Crossing: 1000 calls/day
- WeatherAPI.com: 1M calls/month
- OpenWeather: 1000 calls/day

### SendGrid
- 100 emails/day

### Twilio
- No free tier, pay per message

## Questions to Verify

1. **How many users access the site daily?**
   - Low (<100): Current optimizations are perfect
   - Medium (100-1000): Consider database-backed cache
   - High (>1000): Consider CDN

2. **How many hikes are typically active?**
   - Determines weather API calls needed
   - With cache: Each hike fetched once per hour max

3. **What's your Cloud SQL instance type?**
   - Run: `gcloud sql instances describe hiking-db`
   - Optimize if larger than db-f1-micro

## Conclusion

With weather caching implemented, you've achieved the **biggest cost optimization**. The remaining optimizations (reducing Cloud Run resources) are safe to implement and will provide additional 25-40% savings.

**Next Steps:**
1. Deploy the weather caching changes
2. Monitor cache hit rates for 1 week
3. Reduce Cloud Run memory to 256Mi
4. Reduce Cloud Run CPU to 0.5
5. Set up budget alerts

**Total Expected Savings: $3-8/month (25-40% reduction)**
