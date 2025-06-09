require("dotenv").config();
const express = require('express');
const cors = require('cors');
const path = require("path");
const connectDB = require('./config/db'); // ✅ load DB connection
const movieRoutes = require('./routes/movies');
const axios = require('axios');
const recommendRoute = require('./routes/recommend');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes'); 

const app = express();
connectDB(); // ✅ Connect to DB

app.use(cors());
app.use(express.json());
app.use("/api/movies", movieRoutes);
console.log("Movie routes loaded:");
movieRoutes.stack.forEach(layer => {
  if (layer.route) {
    console.log(`${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
  }
});

//app.use('/api/recommended-by-genres',userRoutes);
// === Route to call Python model for recommendations ===
app.post("/api/recommend", async (req, res) => {
  const { title } = req.body;  // Movie title from the frontend

  try {
      // Send the request to Python API (running on port 5001)
      const response = await axios.post('http://localhost:5001/recommend', { title });

      // Send the response from Python API back to the client
      res.json(response.data);
  } catch (error) {
      console.error("Error calling Python API:", error.message);
      res.status(500).json({ error: "Failed to get recommendations" });
  }
});

app.get('/', (req, res) => {
    res.send('Backend running...');
});

app.get("/test-db", async (req, res) => {
    try {
      const Movie = require("./models/Movie");
      const count = await Movie.countDocuments();
      console.log(count);
      res.send(`✅ Total movies in DB: ${count}`);
    } catch (err) {
      res.status(500).send("❌ Error: " + err.message);
    }
});

connectDB().then(async () => {
  try {
    await Movie.init(); // Ensures indexes declared in schema are created
    console.log('Movie indexes ensured.');
  } catch (err) {
    console.error('Error creating indexes:', err);
  }
});

app.use('/api/users', userRoutes);
app.use('/api/recommend', recommendRoute);
app.use('/api/auth', authRoutes); // Add auth routes

app.use('/api/watchlist', watchlistRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
