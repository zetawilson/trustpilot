# Klaviyo Integration Documentation

## Overview
This application integrates with Klaviyo to send customer feedback events whenever users submit feedback through the rating forms. The integration automatically triggers a "Send feedback" event to Klaviyo containing all feedback details and user information.

## Setup

### 1. Get Your Klaviyo Public API Key
1. Log into your Klaviyo account
2. Navigate to Account > Settings > API Keys
3. Copy your **Public API Key** (starts with "pk_")

### 2. Configure Environment Variable
Add your Klaviyo public key to your `.env` file:

```bash
KLAVIYO_PUBLIC_KEY=pk_your_actual_public_key_here
```

## How It Works

### Event Trigger
The Klaviyo event is automatically triggered when:
- A user submits **high-rating feedback** (4-5 stars) at `/api/feedback/high-rating`
- A user submits **low-rating feedback** (1-3 stars) at `/api/feedback/low-rating`

### Event Details

**Event Name:** `Send feedback`

**Customer Properties Sent:**
- `$email` - User's email address
- `$first_name` - User's name (or "Anonymous" if not provided)

**Event Properties Sent:**
- `feedback_type` - Either "high-rating" or "low-rating"
- `rating` - Numeric rating value (1-5)
- `feedback_text` - The actual feedback message
- `submitted_at` - ISO timestamp of submission
- `ip_address` - User's IP address (if available)
- `rating_category` - "Positive" for ratings ≥ 4, "Negative" for ratings < 4

### Implementation Details

The integration is implemented in:
- **Service Layer:** `/src/lib/klaviyoService.ts` - Handles API communication with Klaviyo
- **API Routes:** 
  - `/src/app/api/feedback/high-rating/route.ts`
  - `/src/app/api/feedback/low-rating/route.ts`

### Error Handling

- If Klaviyo API is not configured (no public key), events are skipped silently
- If Klaviyo API fails, the error is logged but **does not** fail the feedback submission
- Feedback is always saved to the database regardless of Klaviyo status

## Testing

### Manual Testing
1. Ensure your server is running (`npm run dev`)
2. Set your `KLAVIYO_PUBLIC_KEY` in `.env`
3. Run the test script:
   ```bash
   node test-klaviyo.js
   ```

### Verification in Klaviyo
1. Log into your Klaviyo dashboard
2. Go to **Analytics > Metrics**
3. Search for "Send feedback" events
4. Click on the event to see details and properties

### Testing Without Klaviyo
If you don't have a Klaviyo account yet:
- The application will still work normally
- Feedback will be saved to the database
- Console will show a warning that Klaviyo is not configured
- No errors will occur

## Using the Data in Klaviyo

### Create Segments
You can create segments based on feedback:
- **Promoters:** People who gave rating ≥ 4
- **Detractors:** People who gave rating ≤ 3
- **Recent Feedback:** People who submitted feedback in last 30 days

### Trigger Flows
You can create automated flows triggered by the "Send feedback" event:
- Send thank you emails to high-rating customers
- Send follow-up emails to low-rating customers
- Alert team members about negative feedback

### Example Flow Filters
- `Properties about someone > feedback_type equals "low-rating"`
- `Properties about someone > rating is less than 3`
- `Properties about someone > rating_category equals "Negative"`

## API Reference

### Klaviyo Track API
The integration uses Klaviyo's Track API:
- **Endpoint:** `https://a.klaviyo.com/api/track`
- **Method:** GET with base64-encoded data parameter
- **Documentation:** [Klaviyo Track API](https://developers.klaviyo.com/en/reference/track_identify)

## Troubleshooting

### Events Not Appearing in Klaviyo
1. Check that `KLAVIYO_PUBLIC_KEY` is set correctly in `.env`
2. Verify the key starts with "pk_"
3. Check server console logs for any error messages
4. Ensure you're looking at the correct Klaviyo account

### API Errors
- Check server logs for detailed error messages
- Verify your Klaviyo public key is valid and active
- Ensure your Klaviyo account is not suspended or rate-limited

## Security Notes
- Only the **public** API key is used (never the private key)
- The public key is safe to use in client-side code if needed
- User data is sent over HTTPS to Klaviyo's secure endpoints
