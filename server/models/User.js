const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  bio: { type: String, default: '' },
  genres: { type: [String], default: [] },
  
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],

  dob: {
    day: { type: Number, default: null },
    month: { type: Number, default: null },
    year: { type: Number, default: null }
  },

  watchedMovies: [{ 
                    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
                    watchedAt: { type: Date, default: Date.now }
                  }],
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

module.exports = mongoose.model('User', userSchema);
