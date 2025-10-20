# 🥾 User-Friendly Improvements for Hikers - The Narrow Trail Portal

**Date:** October 16, 2025  
**Purpose:** Actionable recommendations to enhance the hiker experience  
**Focus:** Make the portal more intuitive, helpful, and enjoyable for hikers

---

## 📊 Current State Analysis

### ✅ What's Working Well
- Clean, modern interface with dark mode
- Mobile-responsive design (PWA capable)
- Search and filtering system
- Calendar view for planning
- Interest tracking and attendance management
- Payment tracking
- Real-time notifications via WebSocket
- Comments and carpool coordination (backend ready)

### 🔍 Identified Pain Points from Hiker Perspective

1. **Information Overload** - Too much at once, not enough context
2. **Planning Difficulty** - Hard to prepare for hikes
3. **Communication Gaps** - Finding ride shares, asking questions
4. **No Personalization** - Generic experience for everyone
5. **Missing Visual Context** - No maps, photos, or route previews
6. **Weather Uncertainty** - No weather forecasts
7. **Skill Matching** - Unclear if hike matches ability level

---

## 🎯 Priority 1: Essential Quick Wins (1-2 Week Implementation)

### 1. Weather Forecast Integration ⛅
**Impact: HIGH** | **Effort: MEDIUM** | **User Value: Critical for Safety**

**Problem:** Hikers don't know what weather to expect, leading to:
- Poor clothing choices
- Safety risks in severe weather
- Last-minute cancellations
- Unprepared hikers

**Solution:**
```
Hike Details Page Enhancement:
┌─────────────────────────────────────┐
│ 🌤️ Weather Forecast                │
│                                     │
│ Saturday, Oct 21                    │
│ ☀️ 24°C / 18°C                     │
│ 💧 10% chance of rain              │
│ 💨 Wind: 15 km/h                   │
│                                     │
│ [View 7-Day Forecast]              │
│                                     │
│ ⚠️ Weather Alert:                  │
│ High UV expected - bring sunscreen │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing OpenWeather API key (already in Secret Manager)
- Display forecast 7 days before hike
- Show weather alerts prominently
- Auto-update every 6 hours
- Include packing suggestions based on weather

**Backend:** Already have `OPENWEATHER_API_KEY` in secrets
**Frontend:** Create `WeatherWidget.js` component

---

### 2. Interactive Trail Maps 🗺️
**Impact: HIGH** | **Effort: MEDIUM** | **User Value: Visual Understanding**

**Problem:** Hikers can't visualize:
- Where the trail actually goes
- How to get to the meeting point
- Elevation changes
- Distance from their location

**Solution:**
```
Add to Hike Details:
┌─────────────────────────────────────┐
│ 📍 Trail Map                        │
│ ┌─────────────────────────────────┐ │
│ │     [Interactive Map]           │ │
│ │   • Start Point (Meeting)       │ │
│ │   • Trail Route                 │ │
│ │   • End Point                   │ │
│ │   • Parking                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📏 12.5 km from your location      │
│ 🚗 ~18 min drive                   │
│                                     │
│ [Get Directions] [Download GPX]    │
└─────────────────────────────────────┘
```

**Implementation Options:**
1. **Google Maps Embed** (Free tier: 25,000 loads/month)
   - Simple integration
   - Familiar interface
   - Built-in directions
   
2. **Mapbox** (Free tier: 50,000 loads/month)
   - More customization
   - Beautiful terrain views
   - Better styling options

**Features:**
- Show GPS coordinates already in database
- Add meeting point marker
- Option to add trail route (GPX upload)
- Calculate distance from user's location
- One-click directions to meeting point

---

### 3. Visual Hike Gallery 📸
**Impact: MEDIUM** | **Effort: LOW** | **User Value: Inspiration & Context**

**Problem:** 
- Text descriptions don't inspire
- Hard to gauge scenery and difficulty
- No visual memory of past hikes

**Solution:**
```
Hike Card Enhancement:
┌─────────────────────────┐
│ [Hero Image]            │ ← Large, inspiring photo
│                         │
│ 🥾 Suikerbosrand        │
│ ⭐⭐⭐ Moderate         │
│ 📅 Oct 21 • 12 km      │
│                         │
│ [View Gallery: 8 photos]│
└─────────────────────────┘

Hike Details Gallery:
┌─────────────────────────────────────┐
│ 📷 Photo Gallery                    │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐           │
│ │ 1 │ │ 2 │ │ 3 │ │ 4 │  +4 more  │
│ └───┘ └───┘ └───┘ └───┘           │
│                                     │
│ [Upload Photos] (after hike)       │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing `hike_photos` table and endpoints
- Add image upload to hike creation
- Gallery view with lightbox
- Allow users to upload photos after attending
- Set cover photo for each hike

---

### 4. Smart Packing List 🎒
**Impact: MEDIUM** | **Effort: LOW** | **User Value: Preparation Made Easy**

**Problem:**
- Hikers forget essential items
- Unclear what to bring for different hike types
- No way to track what's packed

**Solution:**
```
Before Hike:
┌─────────────────────────────────────┐
│ ✅ Packing Checklist                │
│                                     │
│ Essential Items:                    │
│ ☑️ Water (2L minimum)               │
│ ☑️ Sunscreen                        │
│ ☐ Hat                               │
│ ☐ First aid kit                    │
│                                     │
│ Based on Weather:                   │
│ ☐ Rain jacket (30% rain chance)    │
│ ☐ Extra layer (cool morning)       │
│                                     │
│ Personal Items:                     │
│ ☐ Camera                            │
│ ☐ Snacks                            │
│                                     │
│ [+ Add Custom Item]                 │
│                                     │
│ 6/10 items packed                   │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing `packing_lists` table and endpoints
- Pre-populate based on:
  - Hike type (day vs multi-day)
  - Distance (>15km add extra water)
  - Weather forecast (add rain gear)
  - Season (winter layers, summer sun protection)
- Save user's personal default items
- Mobile-friendly checklist
- Auto-save on check/uncheck

---

### 5. My Hikes Dashboard 📊
**Impact: HIGH** | **Effort: LOW** | **User Value: Personalized Experience**

**Problem:**
- All users see the same view
- Hard to find "my" hikes in full list
- No quick overview of commitments
- Can't see hiking stats

**Solution:**
```
New "My Hikes" Tab:
┌─────────────────────────────────────┐
│ 📊 My Hiking Stats                  │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 18  │ │ 3   │ │ 2   │ │ 215 │   │
│ │Total│ │Next │ │Pay  │ │ km  │   │
│ │Hikes│ │Month│ │Owed │ │Done │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🎯 Upcoming Hikes (3)               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Sat Oct 21 - Suikerbosrand      │ │
│ │ ✅ Confirmed • 💰 Paid          │ │
│ │ ⏰ 3 days away                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Sun Nov 5 - Table Mountain      │ │
│ │ ⭐ Interested • 💳 R250 due     │ │
│ │ ⏰ 18 days away                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📜 Past Adventures (10)             │
│                                     │
│ • Drakensberg - Oct 1, 2025         │
│   ⭐⭐⭐⭐⭐ Amazing!              │
│ • Magaliesberg - Sep 15, 2025       │
│ • Hartebeespoort - Aug 22, 2025     │
│   [Show More]                       │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing `/api/my-hikes` endpoint (already exists!)
- Create new `MyHikesPage.js` component
- Add tab to main navigation
- Show personalized dashboard
- Color-code by status (upcoming, confirmed, paid)
- Quick actions (pay now, cancel interest, view details)

---

## 🎯 Priority 2: Enhanced Communication (2-3 Weeks)

### 6. Better Comments & Q&A 💬
**Impact: MEDIUM** | **Effort: LOW** | **User Value: Community Building**

**Problem:**
- Questions get lost in general chat
- No organized way to ask about specific hikes
- Can't see what others are asking

**Solution:**
```
Hike Details - Comments Tab:
┌─────────────────────────────────────┐
│ 💬 Questions & Comments (12)        │
│                                     │
│ 📌 Pinned by Admin:                 │
│ "Meeting time changed to 6:30 AM"   │
│ - Admin • 2 hours ago               │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Sarah M. • 5 hours ago              │
│ "Is the trail dog-friendly?"        │
│   └─ Admin: "Yes, on leash only"   │
│      1 hour ago                     │
│                                     │
│ John D. • Yesterday                 │
│ "Anyone bringing extra snacks?"     │
│   └─ 3 replies                      │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Ask a question...                   │
│ [────────────────────────]          │
│              [Post Question]        │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing `hike_comments` table and endpoints
- Add comments tab to hike details modal
- Thread replies (nested comments)
- Pin important updates (admin only)
- Real-time updates via WebSocket
- Email notifications for replies

---

### 7. Smart Carpool Matching 🚗
**Impact: MEDIUM** | **Effort: MEDIUM** | **User Value: Cost Savings & Social**

**Problem:**
- Hikers don't know who has space
- Organizing rides via separate channels
- No visibility of carpool options
- Fuel cost sharing unclear

**Solution:**
```
Hike Details - Carpool Tab:
┌─────────────────────────────────────┐
│ 🚗 Ride Sharing (5 offers, 3 needs)│
│                                     │
│ 🚙 Available Rides:                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ John D. driving from Centurion  │ │
│ │ 🪑 2 seats available             │ │
│ │ 📍 Leaving 5:30 AM               │ │
│ │ 💰 R50 fuel share/person         │ │
│ │ [Request Ride] [Contact John]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🙋 Need a Ride:                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Sarah M. from Pretoria East     │ │
│ │ 📍 Can meet at Woodlands Mall    │ │
│ │ [Offer Ride] [Message Sarah]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [I'm Offering a Ride]               │
│ [I Need a Ride]                     │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing `carpool_offers` and `carpool_requests` tables
- Add carpool tab to hike details modal
- Show driver/passenger contact info (phone/WhatsApp)
- Match by location proximity
- Suggested fuel cost calculator
- Confirm/cancel ride bookings

---

### 8. WhatsApp Integration 📱
**Impact: HIGH** | **Effort: LOW** | **User Value: Instant Communication**

**Problem:**
- Email notifications get ignored
- Urgent updates don't reach hikers
- No quick way to contact group

**Solution:**
```
Notification Preferences:
┌─────────────────────────────────────┐
│ 🔔 How do you want to be notified? │
│                                     │
│ ☑️ Email (steyncd@gmail.com)       │
│ ☑️ WhatsApp (+27 82 123 4567)      │
│ ☐ SMS                               │
│                                     │
│ Notify me about:                    │
│ ☑️ New hikes added                  │
│ ☑️ Hike updates & changes           │
│ ☑️ Payment reminders                │
│ ☑️ Weather alerts                   │
│ ☑️ Comments on my hikes             │
│ ☐ Marketing updates                 │
└─────────────────────────────────────┘

Quick Actions:
• [📱 Join WhatsApp Group] button on each hike
• Admin sends updates via WhatsApp
• Hike reminder 24 hours before
```

**Implementation:**
- Use existing Twilio integration (already configured)
- Add WhatsApp number field to user profile
- Send critical updates via WhatsApp:
  - Hike confirmed/cancelled
  - Meeting time changes
  - Weather warnings
  - Payment reminders
- Create hike-specific WhatsApp groups
- Opt-in/opt-out per notification type

---

## 🎯 Priority 3: Skill Matching & Safety (3-4 Weeks)

### 9. Difficulty Rating System 📊
**Impact: MEDIUM** | **Effort: MEDIUM** | **User Value: Better Matching**

**Problem:**
- "Moderate" means different things to different people
- New hikers join difficult hikes unprepared
- Experienced hikers find easy hikes boring

**Solution:**
```
Enhanced Difficulty Display:
┌─────────────────────────────────────┐
│ Difficulty: Moderate                │
│ ⭐⭐⭐☆☆                           │
│                                     │
│ Breakdown:                          │
│ • Distance: 12 km ●●●○○             │
│ • Elevation: 450m gain ●●○○○        │
│ • Technical: Easy trail ●○○○○       │
│ • Fitness: Moderate ●●●○○           │
│                                     │
│ ✅ Good fit for your level!         │
│ Based on your 5 completed hikes     │
│                                     │
│ Similar to: Magaliesberg (Sep 15)   │
└─────────────────────────────────────┘
```

**Implementation:**
- Calculate difficulty score from:
  - Distance (km)
  - Elevation gain (m)
  - Terrain type
  - Technical difficulty
- Store user's hiking history
- Compare to user's past hikes
- Show "Good fit / Challenging / Too easy" indicator
- Suggest similar hikes they've enjoyed

---

### 10. Fitness Level Profiles 💪
**Impact: MEDIUM** | **Effort: LOW** | **User Value: Confidence**

**Problem:**
- New users don't know what they can handle
- Experienced hikers get unchallenging hikes
- Safety risks from mismatched abilities

**Solution:**
```
User Profile:
┌─────────────────────────────────────┐
│ 🏃 My Fitness Level                 │
│                                     │
│ [●●●○○] Moderate                    │
│                                     │
│ I'm comfortable with:               │
│ ☑️ Day hikes up to 15 km            │
│ ☑️ 400m elevation gain               │
│ ☑️ Rocky/uneven terrain             │
│ ☐ Multi-day backpacking             │
│ ☐ Scrambling/climbing               │
│                                     │
│ Experience:                         │
│ • 18 hikes completed                │
│ • Longest: 20 km                    │
│ • Most elevation: 600m              │
│                                     │
│ 🎯 Recommended hikes for you: 12    │
│ [View Recommendations]              │
└─────────────────────────────────────┘
```

**Implementation:**
- Questionnaire on first login
- Update automatically based on completed hikes
- Filter hikes by fitness level
- Show "Recommended for you" badge
- Safety warnings for hikes above level

---

### 11. Emergency Contacts & Safety 🚨
**Impact: HIGH** | **Effort: LOW** | **User Value: Safety & Peace of Mind**

**Problem:**
- Admin doesn't have emergency contacts
- Medical info not readily available
- No quick way to contact hikers in emergency

**Solution:**
```
User Profile - Emergency Info:
┌─────────────────────────────────────┐
│ 🚨 Emergency Information            │
│                                     │
│ Emergency Contact:                  │
│ Name: Jane Doe                      │
│ Phone: +27 82 987 6543             │
│ Relationship: Spouse                │
│                                     │
│ Medical Info:                       │
│ • Allergies: Bee stings             │
│ • Conditions: Asthma (inhaler)      │
│ • Blood type: A+                    │
│ • Medications: Antihistamine        │
│                                     │
│ 🔒 Only visible to admins           │
│ during active hikes                 │
└─────────────────────────────────────┘

Admin View (during hike):
┌─────────────────────────────────────┐
│ 📋 Attendee Emergency Contacts      │
│                                     │
│ 12 hikers attending:                │
│ • Sarah M. [View Contact] 🚨       │
│ • John D. [View Contact] 🚨        │
│ • ...                               │
│                                     │
│ [Download All Contacts] (PDF)       │
│ [Emergency Call Admin] 📞          │
└─────────────────────────────────────┘
```

**Implementation:**
- Use existing emergency contact fields in `users` table
- Add emergency info section to profile
- Show admin button "View Emergency Contacts" on hike details
- Print/download emergency contact sheet
- Include medical conditions and allergies
- Privacy-protected (only admins, only active hikes)

---

## 🎯 Priority 4: Gamification & Engagement (Optional)

### 12. Achievements & Badges 🏆
**Impact: LOW** | **Effort: MEDIUM** | **User Value: Motivation**

**Solution:**
```
┌─────────────────────────────────────┐
│ 🏆 Your Achievements                │
│                                     │
│ Recently Earned:                    │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │ 🥇  │ │ 🗻  │ │ ⛰️  │           │
│ │First│ │1000m│ │10Km │           │
│ │Hike │ │ Up  │ │Club │           │
│ └─────┘ └─────┘ └─────┘           │
│                                     │
│ Progress:                           │
│ • 🌟 Century Club: 18/100 hikes     │
│ • 🏃 Marathon: 215/42 km            │
│ • ⛰️ Summit Master: 4/10 peaks      │
└─────────────────────────────────────┘
```

**Badges:**
- 🥾 First Steps (complete 1 hike)
- 🏃 Regular Hiker (5 hikes)
- 🏔️ Mountain Goat (1000m elevation)
- 🎒 Backpacker (first multi-day)
- 🌟 Century Club (100 hikes)
- 🏆 Peak Bagger (10 summits)
- 📸 Photographer (upload 50 photos)
- 🚗 Carpooler (give 10 rides)
- 💬 Helper (answer 25 questions)

---

### 13. Social Features 👥
**Impact: LOW** | **Effort: MEDIUM** | **User Value: Community**

**Solution:**
```
Hiking Profile:
┌─────────────────────────────────────┐
│ 👤 Sarah M.                         │
│ 📍 Pretoria East                    │
│ 🥾 Hiking since March 2024          │
│                                     │
│ 📊 Stats:                           │
│ • 18 hikes completed                │
│ • 215 km hiked                      │
│ • 3,500m elevation gained           │
│                                     │
│ 🏆 Top Badges:                      │
│ 🏃 Regular Hiker                    │
│ 🏔️ Mountain Goat                    │
│                                     │
│ 🌟 Favorite Hikes:                  │
│ • Drakensberg (★★★★★)             │
│ • Table Mountain (★★★★★)          │
│                                     │
│ [Follow] [Message]                  │
└─────────────────────────────────────┘
```

---

## 📱 Mobile-First Enhancements

### 14. Offline Hike Details 📴
**Impact: MEDIUM** | **Effort: MEDIUM** | **User Value: Reliability**

**Problem:**
- No cell signal on trails
- Can't access hike details during hike
- Packing list not available offline

**Solution:**
- Cache hike details in service worker
- Download trail map for offline use
- Offline packing list access
- "Downloaded for offline" indicator
- Auto-sync when back online

---

### 15. Quick Actions & Widgets 📲
**Impact: LOW** | **Effort: LOW** | **User Value: Convenience**

**Solution:**
```
Mobile Home Screen Widget:
┌─────────────────────┐
│ Next Hike:          │
│ Suikerbosrand       │
│ Saturday, 6:30 AM   │
│ 📍 3 days away      │
│                     │
│ [View Details]      │
│ [Get Directions]    │
└─────────────────────┘
```

**Quick Actions:**
- Share hike via WhatsApp
- Add to calendar (one tap)
- Get directions to meeting point
- Mark attendance
- Upload photos

---

## 🎨 Visual & UX Polish

### 16. Better Typography & Spacing 📝
- Larger, more readable fonts
- Better contrast ratios
- More whitespace
- Clear visual hierarchy
- Consistent spacing

### 17. Loading States & Feedback ⏳
- Skeleton screens while loading
- Success/error toast notifications
- Progress indicators for uploads
- Smooth animations
- "Saved" confirmations

### 18. Accessibility Improvements ♿
- Keyboard navigation
- Screen reader support
- High contrast mode
- Larger touch targets
- Alt text for images

---

## 📊 Implementation Roadmap

### Phase 1: Critical (Weeks 1-2) 🔥
1. ✅ Weather forecast integration
2. ✅ My Hikes dashboard
3. ✅ Packing list with weather-based suggestions
4. ✅ Emergency contact collection

**Why:** Safety and personalization are top priorities

### Phase 2: Communication (Weeks 3-4) 💬
1. ✅ Comments & Q&A implementation
2. ✅ Carpool matching system
3. ✅ WhatsApp notifications
4. ✅ Interactive maps

**Why:** Better communication reduces confusion and builds community

### Phase 3: Engagement (Weeks 5-6) 🎯
1. ✅ Difficulty rating algorithm
2. ✅ Fitness level profiles
3. ✅ Photo galleries
4. ✅ Offline capabilities

**Why:** Keep users engaged and coming back

### Phase 4: Polish (Weeks 7-8) ✨
1. ✅ Achievements & badges
2. ✅ Social features
3. ✅ Mobile widgets
4. ✅ Visual polish

**Why:** Delight users and stand out from competitors

---

## 💡 Quick Wins You Can Implement TODAY

### 1. Add Weather API Call (1 hour)
```javascript
// backend/controllers/hikeController.js
const getWeather = async (lat, lon, date) => {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
  );
  return response.data;
};
```

### 2. Enable Comments Tab (30 minutes)
```javascript
// Frontend already has endpoints, just add UI tab
<Tab eventKey="comments" title="💬 Comments">
  <CommentsList hikeId={hike.id} />
</Tab>
```

### 3. Add "My Hikes" Navigation Link (5 minutes)
```javascript
// Navigation already exists, just expose it
<Nav.Link href="/my-hikes">My Hikes</Nav.Link>
```

### 4. Show Distance to Hike (15 minutes)
```javascript
// Use browser geolocation + GPS coords in database
const distance = calculateDistance(userLat, userLon, hikeLat, hikeLon);
```

---

## 📈 Expected Impact

### User Metrics
- **Engagement**: +40% (personalized dashboard, gamification)
- **Retention**: +30% (better preparation, safety)
- **Satisfaction**: +50% (weather, maps, communication)
- **Dropout Rate**: -60% (skill matching, preparation)

### Operational Metrics
- **Support Queries**: -40% (FAQ via comments)
- **Last-minute Cancellations**: -50% (weather forecasts)
- **Safety Incidents**: -70% (emergency contacts, difficulty matching)
- **Payment Collections**: +30% (reminders, tracking)

---

## 🎯 Success Criteria

### How to Measure Success
1. **User Feedback**: Conduct surveys after each implementation phase
2. **Usage Analytics**: Track feature adoption rates
3. **Engagement Metrics**: Time on site, pages per session
4. **Completion Rates**: Hike attendance vs. registrations
5. **Support Tickets**: Reduction in common questions

### Target KPIs (After 3 Months)
- 80%+ hikers use "My Hikes" dashboard
- 60%+ view weather before hikes
- 40%+ use carpool matching
- 90%+ have emergency contacts on file
- 50%+ upload photos to galleries
- 70%+ enable WhatsApp notifications

---

## 💼 Business Value

### For Hikers
- ✅ Better preparation = more enjoyable hikes
- ✅ Safety improvements = peace of mind
- ✅ Social connections = community building
- ✅ Skill matching = appropriate challenges

### For Admins
- ✅ Reduced support queries
- ✅ Better payment collection
- ✅ Emergency info readily available
- ✅ Easier communication
- ✅ Higher retention rates

### For The Narrow Trail Brand
- ✅ Professional, modern image
- ✅ Competitive advantage
- ✅ Word-of-mouth growth
- ✅ Higher user satisfaction

---

## 🚀 Next Steps

1. **Review & Prioritize**: Review this document with stakeholders
2. **User Validation**: Survey current hikers on top pain points
3. **Create Backlog**: Break down into tickets/issues
4. **Start with Phase 1**: Implement critical features first
5. **Iterate Based on Feedback**: Adjust roadmap as you learn

---

**Remember:** The best features are the ones users actually use. Start with the essentials (weather, safety, personalization), validate with real users, then expand. 

**The goal:** Make hiking with The Narrow Trail so easy and enjoyable that hikers can't imagine planning hikes any other way! 🥾⛰️

---

**Created:** October 16, 2025  
**Status:** Ready for Implementation  
**Next Review:** After Phase 1 completion
