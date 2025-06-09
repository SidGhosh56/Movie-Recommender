const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: String,
    overview: String,
    genres: [String],
    director: String,
    actors: [String],
    characters: [String],
    year: Number,
    votes: Number,
    rating: Number,
    popularity: Number,
    budget: Number,
    poster_url: String
});
movieSchema.index({ overview: 'text' });
module.exports = mongoose.model("Movie", movieSchema);
