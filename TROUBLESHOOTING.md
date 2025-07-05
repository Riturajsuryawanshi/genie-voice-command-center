# Troubleshooting Google OAuth Authentication

## Error: "Unsupported provider: provider is not enabled"

This error occurs when the Google OAuth provider is not properly configured in your Supabase project.

### Quick Fix Steps:

1. **Enable Google Provider in Supabase**

   ```
   Supabase Dashboard → Authentication → Providers → Google → Enable
   ```

2. **Add Google OAuth Credentials**

   - Get Client ID and Client Secret from Google Cloud Console
   - Add them to Supabase Google provider settings

3. **Configure Redirect URLs**
   - Add your site URLs in Supabase Authentication settings

## Step-by-Step Solution

### Step 1: Verify Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `odzagbhwjbphufqgcray`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and ensure it's **enabled**
5. If not enabled, click on Google and toggle the enable switch

### Step 2: Get Google OAuth Credentials

1. **Create Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs**

   - Go to **APIs & Services** → **Library**
   - Search and enable: "Google+ API"

3. **Create OAuth 2.0 Credentials**

   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Application type: **Web application**

4. **Configure OAuth Consent Screen**

   - Go to **OAuth consent screen**
   - User type: **External**
   - App name: "CallGenie"
   - Add your email as developer contact

5. **Add Authorized Redirect URIs**

   ```
   https://odzagbhwjbphufqgcray.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   http://localhost:3000/auth/callback
   ```

6. **Copy Credentials**
   - Note your **Client ID** and **Client Secret**

### Step 3: Configure Supabase

1. **Add Google Credentials**

   - Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - Enter your Google Client ID and Client Secret
   - Click **Save**

2. **Configure Site URLs**
   - Go to **Authentication** → **URL Configuration**
   - Add these URLs:
     ```
     http://localhost:5173
     http://localhost:3000
     ```

### Step 4: Test the Setup

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Use the Auth Test Component**

   - The AuthTest component is temporarily added to the landing page
   - Click "Test Google Sign-In" to debug
   - Check browser console for detailed logs

3. **Check for Errors**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for any error messages

## Common Issues and Solutions

### Issue 1: "Invalid redirect URI"

**Solution:**

- Verify redirect URIs in Google Cloud Console match exactly
- Check that Supabase project URL is correct
- Ensure no trailing slashes in URLs

### Issue 2: "OAuth consent screen not configured"

**Solution:**

- Complete OAuth consent screen setup in Google Cloud Console
- Add your email as a test user if in testing mode
- Wait a few minutes for changes to propagate

### Issue 3: "Client ID not found"

**Solution:**

- Verify Client ID is correct in Supabase
- Make sure Google+ API is enabled
- Check that OAuth consent screen is configured

### Issue 4: Redirect loop

**Solution:**

- Check redirect URLs in both Google Cloud Console and Supabase
- Ensure site URL is properly configured in Supabase
- Clear browser cache and cookies

### Issue 5: "Provider is not enabled"

**Solution:**

- Go to Supabase Dashboard → Authentication → Providers
- Find Google and click "Enable"
- Add Client ID and Client Secret
- Save the configuration

## Debug Steps

1. **Check Browser Console**

   - Open developer tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

2. **Verify Supabase Configuration**

   ```javascript
   // Test in browser console
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: "google",
   });
   console.log("OAuth result:", { data, error });
   ```

3. **Check Network Requests**

   - Open Network tab in developer tools
   - Try to sign in
   - Look for failed requests to Supabase or Google

4. **Verify Environment Variables**
   - Check that Supabase URL and key are correct
   - Ensure no typos in configuration

## Testing Checklist

- [ ] Google provider is enabled in Supabase
- [ ] Client ID and Secret are added to Supabase
- [ ] Redirect URIs are configured in Google Cloud Console
- [ ] Site URLs are configured in Supabase
- [ ] OAuth consent screen is set up
- [ ] Google+ API is enabled
- [ ] No typos in any URLs or credentials

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**

   - Add production domain to authorized redirect URIs
   - Update OAuth consent screen with production domain

2. **Update Supabase Configuration**

   - Add production domain to site URLs
   - Test authentication flow in production

3. **Environment Variables**
   - Use environment variables for sensitive data
   - Ensure HTTPS is used in production

## Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Discord Community](https://discord.supabase.com/)

## Remove Debug Component

Once authentication is working, remove the AuthTest component from LandingPage.tsx:
