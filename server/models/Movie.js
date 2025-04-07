const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    ID: Number,
    title: String,
    overview: String,
    genres: String,
    director: String,
    actors: String,
    characters: String,
    year: Number,
    votes: Number,
    rating: Number,
    popularity: Number,
    budget: Number
});

module.exports = mongoose.model("Movie", movieSchema);
