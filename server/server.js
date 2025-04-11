require("dotenv").config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // ✅ load DB connection
const movieRoutes = require('./routes/movieRoutes');

const app = express();
connectDB(); // ✅ Connect to DB

app.use(cors());
app.use(express.json());
app.use("/api/movies", movieRoutes);

app.get('/', (req, res) => {
    res.send('Backend running...');
});

app.get("/test-db", async (req, res) => {
    try {
      const Movie = require("./models/Movie");
      const count = await Movie.countDocuments();
      res.send(`✅ Total movies in DB: ${count}`);
    } catch (err) {
      res.status(500).send("❌ Error: " + err.message);
    }
  });
  
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
