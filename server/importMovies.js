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
            return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            director: movie.directors || movie.director || 'N/A',  // try both spellings
            actors: movie.actors ? movie.actors.split('|').map(a => a.trim()) : [],
            characters: movie.characters ? movie.characters.split('|').map(c => c.trim()) : [],
            genres: movie.genres ? movie.genres.split(',').map(g => g.trim()) : [],
            year: movie.year,
            votes: isNaN(Number(movie.votes)) ? 0 : Number(movie.votes),
            popularity: isNaN(Number(movie.popularity)) ? 0 : Number(movie.popularity),
            budget: isNaN(Number(movie.budget)) ? 0 : Number(movie.budget),
            rating: isNaN(parseFloat(movie.rating)) ? 0 : parseFloat(movie.rating),
            poster_url: movie.poster_url || '',
        };
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
