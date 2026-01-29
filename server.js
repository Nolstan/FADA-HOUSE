const express = require('express');
require('dotenv').config(); // Load environment variables
const connectDB = require('./database/db');
const helmet = require('helmet');
const cors = require('cors');
const userRoutes = require('./routes/user-routes');
const { router: uploadRoutes } = require('./routes/uploadRoute'); 
const approvalRoutes = require('./routes/approvalRoute');
const uniHostelRoutes = require('./routes/universityHostelRoute');
const generalRoutes = require('./routes/generalRoute');
const authMiddleware = require('./middleware/auth-middleware');
const manageMyUploadsRoutes = require('./routes/manageMyUploads');
const adminUsersRoutes = require('./routes/adminUsersRoutes');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const adminHostelRoutes = require('./routes/adminHostelRoutes');
const generalApprovalRoutes = require('./routes/generalApprovalRoute'); // New route for general house approvals
const adminGeneralHouseRoutes = require('./routes/adminGeneralHouseRoutes');
const fetchGeneralHouseRoutes = require('./routes/fetch-general-house');
const generalContactInfoRoutes = require('./routes/generalContactInfoRoutes');
const forgetPassRoutes = require('./routes/forgetPassRoute');

const app = express();
const port = process.env.PORT || 5000;

// trust the first proxy (important when running on Render, Heroku, etc.)
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// --- CORS Configuration for Production ---
// This setup relies solely on the ALLOWED_ORIGINS environment variable for security.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) // Trim whitespace from each origin
  : [];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) and from whitelisted origins.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} not allowed by CORS`));
    }
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

 
app.use(helmet()); // Adds important security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve Static Files ---
// This makes all the frontend files (HTML, CSS, client-side JS) accessible to the browser.
app.use(express.static('public'));
app.use(express.static('user'));
app.use(express.static('admin'));
app.use(express.static('assets'));
app.use(express.static('.')); // Serve files from the root (e.g., index.html)

// Routes
app.use('/api/users', userRoutes);
app.use('/api/my-uploads', manageMyUploadsRoutes);
app.use('/api/hostels', uploadRoutes); // For hostel uploads
app.use('/api/hostel-approvals', approvalRoutes); // For hostel approvals
app.use('/api/universities', uniHostelRoutes);
app.use('/api/general', generalRoutes);
app.use('/api/general-houses', fetchGeneralHouseRoutes);

app.use('/api/general-approvals', generalApprovalRoutes); // New route


app.use('/api/admin/hostels', adminHostelRoutes);
app.use('/api/admin/general-houses', adminGeneralHouseRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/general-contact-info', generalContactInfoRoutes);
app.use('/api/password', forgetPassRoutes);


// Start Server
app.listen(port, '0.0.0.0',  () => {
  console.log(`Server is running on http://localhost:${port}`);
});
