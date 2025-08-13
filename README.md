# Trust Feedback System

A Next.js application for managing user feedback with authentication and admin approval system.

## Features

- 🔐 **User Authentication**: Email/password login with admin approval
- 👨‍💼 **Admin Dashboard**: Super user can approve/reject signup requests
- 📊 **Feedback Management**: View, filter, and manage user feedback
- ⭐ **Rating System**: High-rating and low-rating feedback forms
- 💾 **Flexible Storage**: File-based (development) and MongoDB (production)

## Getting Started

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy from env.example and update with your values
cp env.example .env.local
```

See [SETUP_ENV.md](./SETUP_ENV.md) for detailed environment variable configuration.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Initialize the Application

Visit `/api/init` to create the super user account, then login at `/login`.

## Usage

- **Super User**: Can approve/reject signup requests and access admin dashboard
- **Regular Users**: Can view feedback dashboard after admin approval
- **Public Forms**: High-rating and low-rating feedback forms are publicly accessible

## Environment Variables

See [SETUP_ENV.md](./SETUP_ENV.md) for complete environment variable documentation.

## Learn More

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
