# Games4u Server

A Node.js Express API server for the Games4u game store application. This backend provides RESTful APIs for user authentication, game management, shopping cart, orders, and more.

## Features

- **User Authentication**: Signup, login, and admin user creation with JWT tokens
- **Game Management**: CRUD operations for games, including variants, pricing, offers, and categories
- **Device Management**: Manage gaming devices
- **Banner Management**: Handle promotional banners
- **Shopping Cart**: Add, update, and manage cart items
- **Order Processing**: Create and manage customer orders
- **File Uploads**: Image upload and processing for games and user profiles
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Centralized error handling and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer with Sharp for image processing
- **Logging**: Winston
- **CORS**: Enabled for cross-origin requests
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd games4u_server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
   DB_NAME=games4u
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   JWT_COOKIE_EXPIRES_IN=7
   BCRYPT_SALT_ROUNDS=12
   ```

4. Ensure the `uploads` and `logs` directories exist (they should be created automatically if not present).

## Usage

### Development

Run the server in development mode with automatic restarts:
```bash
npm run dev
```

### Production

Build and start the server:
```bash
npm start
```

The server will start on the port specified in the `.env` file (default: 5000).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/create-admin` - Create admin user (admin only)

### Users
- `PATCH /api/users/me/photo` - Update My Photo
- `GET /api/users/me` - Get user

### Games
- `GET /api/games` - Get all games
- `GET /api/games/best-sellers` - Get best-selling games
- `GET /api/games/offers` - Get games on offer
- `GET /api/games/:slug` - Get game by slug
- `POST /api/games` - Create new game (admin only)
- `PATCH /api/games/:id` - Update game (admin only)
- `DELETE /api/games/:id` - Delete game (admin only)
- `PATCH /api/games/offers/bulk` - Bulk update offers (admin only)

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create device (admin only)
- `PATCH /api/devices/:id` - Update device (admin only)
- `DELETE /api/devices/:id` - Delete device (admin only)
- `GET /api/games/best-sellers` - Get best-selling devices
- `GET /api/games/offers` - Get device on offer
- `GET /api/games/:slug` - Get device by slug

### Banners
- `GET /api/banners` - Get all banners
- `POST /api/banners` - Create banner (admin only)
- `PATCH /api/banners/:id` - Update banner (admin only)
- `DELETE /api/banners/:id` - Delete banner (admin only)

### Cart
- `GET /api/cart/me` - Get user's cart
- `POST /api/cart/items/add` - Add item to cart
- `DELETE /api/cart/items/remove/:itemId` - Remove item from cart

### Orders
- `GET /api/order` - Get user's orders
- `POST /api/order` - Create new order
- `GET /api/order/:id` - Get order by ID
- `PATCH /api/order/:id` - Update order status (admin only)

## Project Structure

```
games4u_server/
├── config/
│   └── db.Config.js          # Database configuration
├── controllers/              # Route controllers
│   ├── auth.Controller.js
│   ├── banner.Controller.js
│   ├── cart.Controller.js
│   ├── device.Controller.js
│   ├── game.Controller.js
│   ├── order.Controller.js
│   └── user.Controller.js
├── logs/                     # Log files
├── middlewares/              # Express middlewares
│   ├── auth.js               # Authentication middleware
│   ├── cors.Handler.js       # CORS configuration
│   ├── error.Handler.js      # Error handling
│   └── upload.js             # File upload handling
├── models/                   # Mongoose models
│   ├── banner.model.js
│   ├── cart.model.js
│   ├── devices.model.js
│   ├── games.model.js
│   ├── order.model.js
│   └── user.model.js
├── routes/                   # API routes
│   ├── auth.Route.js
│   ├── banner.Route.js
│   ├── cart.Route.js
│   ├── device.Route.js
│   ├── game.Route.js
│   ├── order.Route.js
│   └── user.Route.js
├── uploads/                  # Uploaded files
│   └── users/                # User profile images
├── utilts/                   # Utility functions
│   ├── api.features.js       # API features (filtering, sorting, etc.)
│   ├── app.Error.js          # Custom error class
│   ├── catch.Async.js        # Async error handler
│   ├── error.Codes.js        # Error codes
│   ├── logger.js             # Winston logger configuration
│   ├── response.Codes.js     # Response codes
│   ├── response.js           # Response utilities
│   └── response.Status.js    # HTTP status codes
├── package.json
├── server.js                 # Main application file
└── README.md
```

## Data Models

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- photo: String (default: 'default-user.png')
- role: String (enum: 'admin', 'customer', default: 'customer')
- isActive: Boolean (default: true)

### Game
- name: String (required)
- slug: String (unique, auto-generated)
- description: String (required)
- discount: Number (0-100)
- offerStart: Date
- offerEnd: Date
- variants: Object with primary/secondary pricing
- platform: String (enum: 'ps5', 'ps4', 'xbox')
- category: String (enum: 'action', 'sports', 'rpg', 'adventure', 'fps', 'platformer')
- photo: String (required)
- stock: Number
- sold: Number
- isActive: Boolean

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.