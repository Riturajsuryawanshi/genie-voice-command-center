# Google OAuth Setup for CallGenie

This guide will help you set up Google OAuth authentication for the CallGenie application using Supabase.

## Prerequisites

- A Google Cloud Console account
- A Supabase project
- The CallGenie application running locally

## Step 1: Set up Google OAuth in Google Cloud Console

1. **Go to Google Cloud Console**

   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**

   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type

4. **Configure OAuth Consent Screen**

   - Go to "OAuth consent screen"
   - Choose "External" user type
   - Fill in the required information:
     - App name: "CallGenie"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`, `openid`

5. **Configure Authorized Redirect URIs**

   - In your OAuth 2.0 Client ID settings, add these redirect URIs:
     ```
     976850698075-ev85vibc1h0ijmmm7no0bns179oiceea.apps.googleusercontent.com
     http://localhost:5173/auth/callback
     http://localhost:3000/auth/callback
     ```

6. **Copy Your Credentials**
   - Note down your **Client ID** and **Client Secret**
   - You'll need these for the next step

## Step 2: Configure Supabase Authentication

1. **Go to Your Supabase Dashboard**

   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your CallGenie project

2. **Enable Google Provider**

   - Go to "Authentication" > "Providers"
   - Find "Google" and click "Enable"

3. **Add Google OAuth Credentials**

   - Enter your Google Client ID and Client Secret
   - Save the configuration

4. **Configure Redirect URLs**
   - In Supabase, go to "Authentication" > "URL Configuration"
   - Add your site URLs:
     ```
     http://localhost:5173
     http://localhost:3000
     https://your-production-domain.com
     ```

## Step 3: Environment Variables (Optional)

If you want to use environment variables for better security, create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://odzagbhwjbphufqgcray.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Test the Integration

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Test Google Sign-In**
   - Go to your application
   - Click "Sign in with Google"
   - You should be redirected to Google's OAuth consent screen
   - After authorization, you should be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**

   - Make sure your redirect URIs in Google Cloud Console match exactly
   - Check that your Supabase project URL is correct

2. **"OAuth consent screen not configured"**

   - Complete the OAuth consent screen setup in Google Cloud Console
   - Add your email as a test user if in testing mode

3. **"Client ID not found"**

   - Verify your Client ID is correct in Supabase
   - Make sure Google+ API is enabled

4. **Redirect loop**
   - Check your redirect URLs in both Google Cloud Console and Supabase
   - Ensure your site URL is properly configured

### Debug Steps:

1. Check browser console for errors
2. Verify network requests in browser dev tools
3. Check Supabase logs in the dashboard
4. Ensure all URLs are HTTPS in production

## Security Best Practices

1. **Never expose your Client Secret in client-side code**
2. **Use environment variables for sensitive data**
3. **Regularly rotate your OAuth credentials**
4. **Monitor your OAuth usage in Google Cloud Console**
5. **Set up proper CORS policies**

## Production Deployment

When deploying to production:

1. Update redirect URIs in Google Cloud Console
2. Update site URLs in Supabase
3. Use HTTPS for all URLs
4. Set up proper domain verification
5. Configure production environment variables

## Support

If you encounter issues:

1. Check the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
2. Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the browser console and network tab for errors
4. Verify all configuration steps were completed correctly
