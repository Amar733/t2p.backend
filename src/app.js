const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Enable CORS globally with refined configuration
app.use(cors());
app.options("*", cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// var DB_URL = "mongodb+srv://t2p_user:SYX2fO3ivZjeROtC@t2p-db.e9jrk.mongodb.net/t2p?retryWrites=true&w=majority&appName=Cluster0"
// Use environment variables for MongoDB connection URL
//const dbUrl ="mongodb://127.0.0.1:27017/t2p";
//const dbUrl = "mongodb+srv://new_t2p_user:unvLqFaeJMaqD1MH@t2p-db.e9jrk.mongodb.net/t2p?retryWrites=true&w=majority&appName=Cluster0";
// const dbUrl = "mongodb://root:HEXk6D4h78EV3Dc4@localhost:27017/new_api?authSource=admin";
const dbUrl = "mongodb://localhost:27017/t2p";

// const dbUrl = DB_URL 
// Mongoose configuration to avoid deprecated options
mongoose.set("strictQuery", true); // Ensure strict query mode
mongoose.set("useFindAndModify", false); // Avoid deprecated `findOneAndUpdate`/`findOneAndDelete`
mongoose.set("useCreateIndex", true); // Use `createIndexes` instead of `ensureIndex`

// Connect to MongoDB with async/await and error handling
(async () => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully.");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit the process if connection fails
  }
})();

// Configure body parsing
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 100000,
  })
);

// Serve static files from the 'images' directory efficiently
app.use("/images", express.static(path.join(__dirname, "images")));

// Set timezone via environment variable
process.env.TZ = "Asia/Kolkata";

// Dynamic Router Import for better modularity and maintainability
const routes = [
  "app",
  "web",
  "admin",
  "RoleAndPermission",
  "report",
  "BlogRoute",
  "Testimonial",
  "FAQRouter",
  "Logs",
];

// Import and initialize routes
routes.forEach((route) => {
  try {
    const router = require(`./router/${route}.js`);
    router(app);
  } catch (err) {
    console.error(`Failed to load route: ${route}`, err);
  }
});

// Export app for serverless or local hosting
module.exports = app;
