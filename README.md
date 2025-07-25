# Inventory Management System

A professional inventory management system built with Next.js, Node.js, and MongoDB.

## Prerequisites

Before running this application on your PC, make sure you have the following installed:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Setup Instructions

### 1. Download/Clone the Project

If you have the project files, extract them to a folder on your PC.

### 2. Install Dependencies

Open a terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install all required packages including Next.js, React, MongoDB drivers, and UI components.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory of your project with the following content:

```env
MONGODB_URI=mongodb+srv://mulaninisarg123:nisarg123@inventory.lzm91le.mongodb.net/inventory-management?retryWrites=true&w=majority&appName=Inventory
```

**Important:** Replace the MongoDB URI with your actual connection string if different.

### 4. Database Setup

Since you're using MongoDB Atlas (cloud database), you don't need to install MongoDB locally. Your connection string should work directly.

If you want to use a local MongoDB instead:
1. Install MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Update MONGODB_URI to: `mongodb://localhost:27017/inventory-management`

### 5. Run the Development Server

Start the application with:

```bash
npm run dev
```

The application will be available at: http://localhost:3000

### 6. Build for Production (Optional)

To create a production build:

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── products/          # Products page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── products/          # Product components
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utilities and database
│   ├── models/            # MongoDB models
│   ├── mongodb.ts         # Database connection
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## Features

- **Dashboard**: Overview of inventory with statistics and charts
- **Product Management**: Add, edit, delete, and search products
- **Category Management**: Organize products by categories
- **Supplier Management**: Manage supplier information
- **Stock Tracking**: Monitor stock levels and low stock alerts
- **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Use a different port
   npm run dev -- -p 3001
   ```

2. **MongoDB connection errors**
   - Verify your MONGODB_URI in .env.local
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure your MongoDB Atlas cluster is running

3. **Module not found errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Build errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that your MongoDB connection is working

For additional help, check the Next.js documentation: https://nextjs.org/docs