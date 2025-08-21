# Fortune-Machinery-1.0
# 🏭 Fortune Machinery - Industrial Machinery Platform
LIVE DEPLOYMENT ON RENDER
https://fortune-machinery-2-0-1.onrender.com

A comprehensive full-stack web application for managing and showcasing industrial machinery, built with React, Node.js, and MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Performance Optimizations](#-performance-optimizations)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🎯 Public Features
- **Homepage**: Hero section, featured products, success stories
- **Product Catalog**: Hierarchical category/subcategory/machine browsing
- **Machine Details**: Comprehensive product information with galleries
- **Video Gallery**: Industrial machinery videos and demonstrations
- **Success Stories**: Customer testimonials and case studies
- **About Us**: Company information and mission
- **Contact**: Contact forms and location information
- **User Authentication**: Registration, login, and profile management
- **Shopping Cart**: Add machines to cart and manage orders
- **Responsive Design**: Mobile-first approach with optimized layouts

### 🔧 Admin Features
- **Dashboard**: Overview of system statistics and recent activities
- **Category Management**: Create, edit, and organize product categories
- **Subcategory Management**: Manage subcategories within categories
- **Machine Management**: Add, edit, and manage machinery listings
- **Video Management**: Upload and manage demonstration videos
- **Partner Management**: Manage business partners and collaborations
- **Success Story Management**: Create and manage customer testimonials
- **User Feedback Management**: Monitor and respond to user feedback
- **User Success Story Management**: Manage user-submitted stories
- **About Page Management**: Edit company information and content
- **Contact Management**: Manage contact inquiries and responses
- **Settings Management**: Configure system settings and preferences
- **Subscription Management**: Handle newsletter and subscription features

### 🚀 Technical Features
- **Code Splitting**: Lazy loading for optimal performance
- **Bundle Optimization**: Manual chunking and tree shaking
- **Image Optimization**: Cloudinary integration for media management
- **Security**: JWT authentication, rate limiting, and input validation
- **File Upload**: Multi-file upload with image cropping
- **Real-time Updates**: Dynamic content updates without page refresh
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Meta tags and structured data

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API communication
- **React Intersection Observer**: Lazy loading and animations
- **React Image Crop**: Image cropping functionality

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token authentication
- **Multer**: File upload middleware
- **Cloudinary**: Cloud media management
- **bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **Morgan**: HTTP request logger
- **CORS**: Cross-origin resource sharing

### Development Tools
- **ESLint**: Code linting and formatting
- **Nodemon**: Development server with auto-restart
- **Rollup Plugin Visualizer**: Bundle analysis

## 📁 Project Structure

```
fortune-machinery2/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin/              # Admin-specific components
│   │   │   └── public/             # Public-facing components
│   │   ├── context/                # React context providers
│   │   ├── pages/                  # Page components
│   │   │   └── admin/              # Admin pages
│   │   ├── routes/                 # Route protection components
│   │   ├── services/               # API service functions
│   │   └── utils/                  # Utility functions
│   ├── package.json
│   └── vite.config.js
├── server/                          # Backend Node.js application
│   ├── config/                      # Database configuration
│   ├── middleware/                  # Express middleware
│   ├── models/                      # MongoDB schemas
│   ├── routes/                      # API route handlers
│   ├── uploads/                     # File upload directory
│   ├── utils/                       # Utility functions
│   ├── package.json
│   └── server.js
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd fortune-machinery2
```

### Step 2: Install Dependencies

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd client
npm install
```

### Step 3: Environment Configuration
Create `.env` files in both `server/` and `client/` directories (see Environment Variables section).

### Step 4: Database Setup
1. Start MongoDB service
2. Create database collections (will be created automatically on first run)

### Step 5: Start Development Servers

#### Backend (Terminal 1)
```bash
cd server
npm run dev
```
Server will start on `http://localhost:5000`

#### Frontend (Terminal 2)
```bash
cd client
npm run dev
```
Client will start on `http://localhost:5173`

## 🔧 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fortune-machinery
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NODE_ENV=development
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

## 📖 Usage

### Public Access
1. Visit `https://fortune-machinery-2-0-1.onrender.com`
2. Browse categories and products
3. Register/login for cart functionality
4. Contact for inquiries

### Admin Access
1. Navigate to `/admin/login`
2. Use admin credentials
3. Access dashboard and management tools

### Key Features Usage

#### Product Management
- Navigate through categories → subcategories → machines
- View detailed machine information with galleries
- Add machines to cart (requires login)

#### Admin Panel
- **Dashboard**: View system overview and statistics
- **Categories**: Manage product categories and hierarchy
- **Machines**: Add/edit machine listings with images and videos
- **Content**: Manage about pages, success stories, and partners

#### File Upload
- Support for images (JPG, PNG, WebP)
- Video uploads for machine demonstrations
- Automatic image optimization via Cloudinary
- Image cropping functionality

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Machines
- `GET /api/machines` - Get all machines
- `GET /api/machines/:id` - Get specific machine
- `POST /api/machines` - Create machine (admin)
- `PUT /api/machines/:id` - Update machine (admin)
- `DELETE /api/machines/:id` - Delete machine (admin)

### Media
- `POST /api/media/upload` - Upload images/videos
- `DELETE /api/media/:id` - Delete media (admin)

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/dashboard` - Dashboard data

### Other Endpoints
- Partners, Success Stories, About, Contact, Settings, Subscriptions, Users, Feedback

## ⚡ Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of routes and components
- **Bundle Optimization**: Manual chunking for better caching
- **Image Optimization**: Lazy loading and responsive images
- **Tree Shaking**: Unused code elimination
- **Caching**: Browser caching strategies

### Backend Optimizations
- **Rate Limiting**: API request throttling
- **Compression**: Response compression
- **Security Headers**: Helmet middleware
- **Database Indexing**: Optimized queries
- **File Upload Limits**: Configurable upload sizes

### Build Optimizations
```bash
# Analyze bundle size
npm run build:analyze

# Production build
npm run build
```

## 🚀 Deployment

### Frontend Deployment (Render)
1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure environment variables

### Backend Deployment (Render)
1. Set up environment variables
2. Deploy from Git repository
3. Configure MongoDB connection

### Database Deployment
- **MongoDB Atlas**: Cloud database service
- **Local MongoDB**: For development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Test features thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Fortune Machinery**

*Last updated: july 2025* 
