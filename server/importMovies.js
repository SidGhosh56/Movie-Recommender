const mongoose = require("mongoose");
const csv = require("csvtojson");
require("dotenv").config();
const Movie = require("./models/Movie"); 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected ✅");

        let movies = await csv().fromFile("./import/project.csv");

        // Transform genres from string to array for each movie
        movies = movies.map(movie => {
            // Check if genres field exists and is a string
            if (movie.genres && typeof movie.genres === 'string') {
                movie.genres = movie.genres.split(',').map(g => g.trim());
            } else {
                movie.genres = []; // default empty array if missing
            }
            return movie;
        });

        await Movie.insertMany(movies);
        console.log("Movies imported 🎬");

        process.exit(); 
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

connectDB();
