# How to Get Your Google Gemini API Key

Follow these simple steps to get your free Gemini API key:

## Step 1: Visit Google AI Studio

Go to: **https://makersuite.google.com/app/apikey**

(Or search for "Google AI Studio API Key" in your browser)

## Step 2: Sign In

- Sign in with your Google account
- If you don't have one, create a free Google account first

## Step 3: Create API Key

1. Click the **"Create API Key"** button
2. You may need to:
   - Accept terms of service
   - Select or create a Google Cloud project (a default one will be created for you)
3. Your API key will be generated instantly

## Step 4: Copy Your API Key

- Click the **copy icon** next to your API key
- It will look something like: `AIzaSyD...` (a long string of characters)
- **Important**: Keep this key private and don't share it publicly!

## Step 5: Add to Your Project

1. In your HealthCompanion project folder, create a file named `.env` (if it doesn't exist)
2. Open the `.env` file
3. Add this line:
   ```
   VITE_GEMINI_API_KEY=paste_your_api_key_here
   ```
4. Replace `paste_your_api_key_here` with the actual key you copied

## Step 6: Restart Your Dev Server

1. Stop your current dev server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

## Done! 🎉

Your AI chatbot should now work! Try asking it a health question like:
- "What is ibuprofen used for?"
- "Side effects of aspirin"
- "How to manage high blood pressure?"

---

## Troubleshooting

**If the chatbot still shows an error:**

1. **Check your .env file:**
   - Make sure there are no spaces around the `=` sign
   - Make sure the file is named exactly `.env` (not `.env.txt`)
   - The file should be in the root folder of your project (same level as `package.json`)

2. **Verify the API key:**
   - Make sure you copied the entire key
   - No extra spaces at the beginning or end

3. **Restart the server:**
   - Always restart after changing `.env` files

**Example of correct .env file:**
```
VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Free Tier Limits

Google Gemini's free tier includes:
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ More than enough for personal use!

If you need more, you can upgrade to a paid plan later.

---

## Security Note

⚠️ **Never commit your `.env` file to Git!**

The `.env` file is already in `.gitignore`, so it won't be uploaded to GitHub. This keeps your API key safe.
