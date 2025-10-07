# How to Generate a Long-Lived Token for Home Assistant

## Why Do You Need a Long-Lived Token?

Regular login tokens expire after 24 hours. Long-lived tokens are specifically designed for integrations like Home Assistant and remain valid for 1 year, so your integration continues to work without needing to re-authenticate constantly.

## Step-by-Step Guide

### Step 1: Log Into the Hiking Portal

1. Go to https://helloliam.web.app
2. Log in with your email and password

### Step 2: Navigate to Your Profile

1. Click on your name in the top right corner
2. Select **"My Profile"** from the dropdown menu

### Step 3: Find Integration Tokens Section

1. Scroll down past your profile stats
2. Look for the **"Integration Tokens"** card
3. It has a key icon 🔑 and description about Home Assistant

### Step 4: Generate Your Token

1. Click the **"+ Generate Token"** button (blue, on the right)
2. In the modal that appears, enter a name for your token
   - Example: `Home Assistant`
   - Example: `My Smart Home`
   - This helps you identify it later
3. Click **"Generate Token"**

### Step 5: Copy Your Token

⚠️ **IMPORTANT**: You will only see the token ONCE!

1. A new modal appears showing your token
2. It's a long string of random characters
3. Click the copy button (📋) or manually select and copy
4. **Save it somewhere safe temporarily** (like a text file)

Example token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6Imhpa2VyIiwidHlwZSI6ImxvbmdfbGl2ZWQiLCJpYXQiOjE3MDQ2MTIwMDAsImV4cCI6MTczNjE0ODAwMH0.abcd1234efgh5678ijkl90mnopqr
```

### Step 6: Use in Home Assistant

1. In Home Assistant: **Settings** → **Devices & Services**
2. Click **"+ Add Integration"**
3. Search for **"The Narrow Trail"**
4. When prompted, paste your token
5. Click **Submit**

✅ Done! Your integration is now connected and will stay connected for 1 year.

---

## Managing Your Tokens

### View All Tokens

In your profile's **Integration Tokens** section, you can see:
- Token name
- When it was created
- When it was last used
- When it expires (1 year from creation)

### Revoke a Token

If you need to remove access (e.g., you're no longer using that integration):

1. Find the token in the list
2. Click the red trash icon 🗑️
3. Confirm the deletion

The integration will immediately stop working with that token.

### Generate Multiple Tokens

You can generate multiple tokens for different purposes:
- One for Home Assistant
- One for a mobile app
- One for testing

Each token is independent - revoking one doesn't affect the others.

---

## Token Security

### Best Practices

✅ **DO:**
- Give each token a descriptive name
- Revoke tokens you're no longer using
- Generate a new token if you suspect it was compromised

❌ **DON'T:**
- Share your tokens with anyone
- Post them publicly (GitHub, forums, etc.)
- Use the same token on multiple devices if they could be compromised independently

### What if I Lose My Token?

No problem! Just revoke the old one and generate a new one:

1. Go to your profile
2. Revoke the old token (if you still see it)
3. Generate a new token
4. Update it in Home Assistant

---

## Troubleshooting

### "Token not found" error

Make sure you copied the entire token. It should be very long (200+ characters).

### Token expires too quickly

Long-lived tokens are valid for 1 year. If your integration stops working before then:
1. Check if the token was revoked
2. Generate a new token
3. Update it in Home Assistant

### Can't find Integration Tokens section

Make sure:
1. You're logged in
2. You're on YOUR profile page (not someone else's)
3. The backend has been updated with token generation support

---

## Technical Details

### Token Format

Long-lived tokens are JWT (JSON Web Tokens) containing:
- User ID
- Email
- Name
- Role
- Type: `long_lived`
- Expiration: 365 days from creation

### Security

- Tokens are hashed and stored in the database
- Only the last 10 characters are stored for identification
- Full tokens are never stored or retrievable
- Tokens can be revoked instantly

### API Endpoints

- `POST /api/tokens/generate` - Generate new token
- `GET /api/tokens` - List your tokens
- `DELETE /api/tokens/:id` - Revoke a token

---

## Questions?

If you have trouble generating or using tokens:
1. Check this guide again
2. Try logging out and back in
3. Contact support with details about the error
