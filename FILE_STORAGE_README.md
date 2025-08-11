# Hybrid Storage System

This application uses a hybrid storage approach:
- **Development**: File-based storage (JSON file)
- **Production**: MongoDB Atlas (cloud database)

## How It Works

### Storage Locations
- **Development**: `data/feedback.json` (in project root)
- **Production**: MongoDB Atlas database `trustpilot`, collection `feedbacks`
- **Format**: JSON array of feedback objects (dev) / MongoDB documents (prod)
- **Auto-created**: Files and collections are created automatically when the first feedback is submitted

### Data Structure
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "rating": 5,
    "feedback": "Great service!",
    "name": "John Doe",
    "type": "high-rating",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
]
```

## Features

### ✅ **Automatic File Management**
- Creates `data/` directory if it doesn't exist
- Creates `feedback.json` file automatically
- Handles file read/write errors gracefully

### ✅ **Full CRUD Operations**
- **Create**: Add new feedback entries
- **Read**: Retrieve all feedback with filtering
- **Update**: (Not implemented - would require additional logic)
- **Delete**: Remove specific feedback entries

### ✅ **Statistics & Analytics**
- Total feedback count
- Average ratings by type
- Filtering by email, rating type, etc.

### ✅ **Development Tools**
- Add sample data for testing
- Clear all data
- Development-only API endpoints

## API Endpoints

### Submit Feedback
- `POST /api/feedback/high-rating` - Submit high-rating feedback (4-5 stars)
- `POST /api/feedback/low-rating` - Submit low-rating feedback (1-3 stars)

### Retrieve Feedback
- `GET /api/feedback` - Get all feedback (with optional filters)
- `GET /api/feedback/stats` - Get feedback statistics

### Development Tools (Development Only)
- `POST /api/feedback/sample` - Add sample feedback data
- `DELETE /api/feedback/sample` - Clear all feedback data

## Usage

### 1. Submit Feedback
Users can submit feedback through the feedback forms:
- `/high-rating?email=user@example.com&rate=5`
- `/low-rating?email=user@example.com&rate=2`

### 2. View Feedback Dashboard
- Navigate to `/dashboard/feedback` (requires authentication)
- View all submitted feedback with statistics
- Filter by feedback type (high/low rating)

### 3. Development Testing
- Use "Add Sample Data" button to populate with test data
- Use "Clear All Data" button to reset the database
- Sample data includes various rating types and realistic feedback

## File Management

### Automatic Creation
The system automatically:
1. Creates the `data/` directory if it doesn't exist
2. Creates `feedback.json` file if it doesn't exist
3. Initializes with an empty array `[]` if the file is empty

### Error Handling
- If the file is corrupted, it returns an empty array
- If the directory can't be created, it throws an error
- If the file can't be written, it throws an error

### Data Persistence
- Data persists between server restarts
- File is automatically backed up (it's just a JSON file)
- Can be manually edited if needed

## Production Deployment

This application automatically switches to MongoDB Atlas in production mode. The feedback data will be stored in the `trustpilot` database, `feedbacks` collection.

### Environment Variables Required:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Deployment Considerations:
1. **MongoDB Atlas**: Ensure your cluster is running and accessible
2. **Connection String**: Set the MONGODB_URI environment variable in your deployment platform
3. **Database Permissions**: Ensure your MongoDB user has read/write access to the trustpilot database
4. **Network Access**: Configure IP whitelist in MongoDB Atlas if needed

## Advantages of File-Based Storage

### ✅ **Simple Setup**
- No database configuration required
- No external dependencies
- Works out of the box

### ✅ **Easy Development**
- Data is human-readable JSON
- Can manually edit the file
- Easy to backup and restore

### ✅ **Fast Development**
- No network latency
- No connection issues
- Immediate feedback

### ✅ **Version Control Friendly**
- Can track data changes (if not in .gitignore)
- Easy to share test data
- Simple rollback process

## Limitations

### ⚠️ **Production Considerations**
- Limited concurrent access handling
- Basic data validation
- Manual backup/restore mechanisms required

### ❌ **Scalability Issues**
- File size grows with data
- No indexing for large datasets
- Memory usage increases with file size

### ❌ **No Advanced Features**
- No complex queries
- No aggregation pipelines
- No real-time updates

## Best Practices

1. **Regular Backups**: Copy `data/feedback.json` regularly
2. **Test Data**: Use sample data for testing, not production data
3. **File Size**: Monitor file size and migrate to MongoDB if it gets too large
4. **Security**: Don't commit sensitive data to version control

## Troubleshooting

### File Not Found
- Check if `data/` directory exists
- Check if `feedback.json` file exists
- Ensure write permissions in project directory

### Data Not Persisting
- Check file permissions
- Ensure server has write access
- Verify file path is correct

### Performance Issues
- File might be too large
- Consider migrating to MongoDB
- Implement pagination if needed

## Next Steps

For production deployment:
1. Set up MongoDB Atlas cluster (already configured)
2. Add MONGODB_URI environment variable to your deployment platform
3. Deploy your application - it will automatically use MongoDB in production
4. Test the feedback submission and retrieval functionality
5. Monitor MongoDB Atlas dashboard for data and performance

### Environment Variable Setup:
- **Vercel**: Add MONGODB_URI in Project Settings > Environment Variables
- **Netlify**: Add MONGODB_URI in Site Settings > Environment Variables
- **Railway**: Add MONGODB_URI in Variables section
