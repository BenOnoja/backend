const express = require('express');
const cors = require('cors');
const { createTables } = require('./db');

// Import routes
const uploadBookRoute = require('./routes/uploadBook');
const getBooksRoute = require('./routes/getBooks');
const storeTelegramUserRoute = require('./routes/storeTelegramUser');
const getReviewsRoute = require('./routes/getReviews');
const submitReviewRoute = require('./routes/submitReview');
const uploadedBookRoute=require('./routes/uploadedBook');
const recentBookRoute=require('./routes/recentBook');
const bookRoute= require('./routes/bookRoutes.js');
const deleteBookRoute = require('./routes/deleteBook.js');
// Import payment route
const paymentRoute = require('./routes/paymentRoutes.js'); // Import the payment functionality
// Import progress routes
const progressRoute = require('./routes/progressRoutes');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'telegram-user-id'], // Allow telegram-user-id in headers
};
app.options('*',cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create tables if they do not exist
createTables();

// Routes
app.use('/api', uploadBookRoute);
app.use('/api', getBooksRoute);
app.use('/api', storeTelegramUserRoute);
app.use('/api', getReviewsRoute);  // New route for fetching reviews
app.use('/api', submitReviewRoute); // New route for submitting reviews
app.use('/api', paymentRoute); // Register the payment route
app.use('/api',uploadedBookRoute);
app.use('/api', recentBookRoute);
app.use('/api',bookRoute);

// Register the progress routes
app.use('/api', progressRoute);
// Other imports and middleware setup here
app.use('/api', deleteBookRoute);
// Serve static files (book files and cover photos)


// Start the server, etc.


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});