# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas to store feedback data for the Trust application.

## 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account or log in if you already have one
3. Create a new project or use an existing one

## 2. Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

## 3. Set Up Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

## 4. Set Up Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

## 5. Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `trust-feedback`

## 6. Environment Variables

Create a `.env.local` file in your project root and add:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/trust-feedback?retryWrites=true&w=majority
MONGODB_DB_NAME=trust-feedback
```

## 7. Database Schema

The application will automatically create the following collection:

### Collection: `feedback`

```javascript
{
  _id: ObjectId,
  email: String,           // User's email address
  rating: Number,          // 1-5 star rating
  feedback: String,        // User's feedback text
  name: String,            // Optional user name
  type: String,            // "high-rating" or "low-rating"
  timestamp: Date,         // When feedback was submitted
  ipAddress: String,       // User's IP address
  userAgent: String        // User's browser/device info
}
```

## 8. API Endpoints

### Submit Feedback
- `POST /api/feedback/high-rating` - Submit high-rating feedback (4-5 stars)
- `POST /api/feedback/low-rating` - Submit low-rating feedback (1-3 stars)

### Retrieve Feedback
- `GET /api/feedback` - Get all feedback (with optional filters)
- `GET /api/feedback/stats` - Get feedback statistics

### Query Parameters
- `type=high-rating|low-rating` - Filter by feedback type
- `email=user@example.com` - Filter by email
- `limit=50` - Number of results per page
- `page=1` - Page number

## 9. Dashboard Access

Once set up, you can view all feedback at:
- `/dashboard/feedback` - Feedback dashboard (requires authentication)

## 10. Testing

1. Start your development server: `npm run dev`
2. Visit `/feedback-demo` to test the feedback system
3. Submit test feedback and check your MongoDB Atlas dashboard
4. View feedback in the dashboard at `/dashboard/feedback`

## 11. Production Considerations

- Use environment-specific connection strings
- Set up proper network access rules
- Enable MongoDB Atlas monitoring and alerts
- Consider setting up automated backups
- Use MongoDB Atlas App Services for additional features

## 12. Troubleshooting

### Connection Issues
- Verify your IP is whitelisted in Network Access
- Check username/password in connection string
- Ensure cluster is running

### Database Not Found
- The database and collection will be created automatically
- Check that your connection string includes the database name

### Permission Errors
- Verify database user has read/write permissions
- Check that the user is not restricted to specific databases

## Support

For MongoDB Atlas issues, refer to the [official documentation](https://docs.atlas.mongodb.com/).
