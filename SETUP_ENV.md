# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# MongoDB Configuration (for production)
MONGODB_URI=mongodb+srv://dchin243:vywgM8PMD9ZOwcCK@cluster0.lyxhd6q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Storage Configuration
FORCE_FILE_STORAGE=true  # Set to 'true' to force file storage even in production

# Authentication Configuration
# Super user credentials (required for admin functionality)
SUPER_USER_EMAIL=your-super-user-email@example.com
SUPER_USER_PASSWORD=your-secure-password

# Note: 
# - Development: Uses file-based storage (data/feedback.json)
# - Production: Uses MongoDB Atlas (trustpilot database, feedbacks collection)
# - Windows SSL issues: Set FORCE_FILE_STORAGE=true to use file storage
# - Authentication: Users sign up and await admin approval before login
```

## Super User Setup

1. **Set your super user credentials** in the `.env.local` file:
   ```bash
   SUPER_USER_EMAIL=your-admin-email@example.com
   SUPER_USER_PASSWORD=your-secure-password
   ```

2. **Initialize the application** by visiting `/api/init` in your browser or running:
   ```bash
   curl http://localhost:3000/api/init
   ```

3. **Login with your super user credentials** at `/login`

## Security Notes

- **Never commit** your `.env.local` file to version control
- **Use strong passwords** for the super user account
- **Change default credentials** from the example values
- **Keep credentials secure** and share only with authorized team members

## Default Development Credentials

If you want to use the original development credentials:
```bash
SUPER_USER_EMAIL=benbrahimpok@gmail.com
SUPER_USER_PASSWORD=123123123
```

⚠️ **Warning**: These are development credentials only. Use secure credentials in production!
