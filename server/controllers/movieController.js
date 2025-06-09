const Movie = require("../models/Movie");
const User = require('../models/User');
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMovie = async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getRandomMovie = async (req, res) => {
    try {
        const count = await Movie.countDocuments(); // Get the total number of movies
        const randomIndex = Math.floor(Math.random() * count); // Generate a random index
        const randomMovie = await Movie.findOne().skip(randomIndex); // Get the movie at that index
        
        if (!randomMovie) {
            return res.status(404).json({ error: "No movies found" });
        }

        res.json(randomMovie); // Return the random movie
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSurpriseMovie = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const favoriteGenres = user.genres;

        if (!favoriteGenres || favoriteGenres.length === 0) {
            // Fallback to fully random movie if no favorite genres
            const count = await Movie.countDocuments({
                rating: { $gte: 6.5 },
                votes: { $gte: 50 }
            });
            const randomIndex = Math.floor(Math.random() * count);
            const randomMovie = await Movie.findOne({
              rating: { $gte: 6.5 },
              votes: { $gte: 50 }
            }).skip(randomIndex);

            if (!randomMovie) {
                return res.status(404).json({ error: "No movies found" });
            }

            return res.json(randomMovie);
        }

        // If user has favorite genres → pick a random movie from those genres
        const matchingMovies = await Movie.find({
            genres: { $in: favoriteGenres },
            rating: { $gte: 7 },
            votes: { $gte: 500 }
        });

        if (matchingMovies.length === 0) {
            return res.status(404).json({ error: "No movies found matching your favorite genres" });
        }

        const randomIndex = Math.floor(Math.random() * matchingMovies.length);
        const randomMovie = matchingMovies[randomIndex];

        res.json(randomMovie);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMoviesByGenre = async (req, res) => {
  try {
    const genresQuery = req.query.genres;
    if (!genresQuery) {
      return res.status(400).json({ error: 'Genres query parameter is required' });
    }

    const genres = genresQuery.split(',').map(g => g.trim());

    // Create an array of regex filters, one for each genre
    const genreRegexes = genres.map(g => new RegExp(`\\b${g}\\b`, 'i'));

    // Query for movies where 'genres' string matches any of these regexes
    const movies = await Movie.find({ 
      $or: genreRegexes.map(regex => ({ genres: regex })) 
    })
    .sort({ rating: -1, popularity: -1, votes: -1 })  // descending order
    .limit(10);

    if (movies.length === 0) {
      return res.status(404).json({ message: 'No movies found for selected genres.' });
    }

    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendedByGenres = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteGenres = user.genres;
    if (!favoriteGenres || favoriteGenres.length === 0) {
      return res.status(200).json({ movies: [] }); // no genres, no recommendations
    }

    const m = 50; // minimum votes to qualify (you can tweak this)
    const CResult = await Movie.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    const C = CResult[0]?.averageRating || 0;

    const genreRegexes = favoriteGenres.map(g => new RegExp(`\\b${g}\\b`, 'i'));

    const recommendedMovies = await Movie.aggregate([
      {
        $match: {
          $or: genreRegexes.map(regex => ({ genres: regex })),
          votes: { $gte: m }
        }
      },
      {
        $addFields: {
          weightedRating: {
            $add: [
              { $multiply: [ { $divide: ["$votes", { $add: ["$votes", m] }] }, "$rating" ] },
              { $multiply: [ { $divide: [m, { $add: ["$votes", m] }] }, C ] }
            ]
          }
        }
      },
      { $sort: { weightedRating: -1 } },
      { $limit: 10 }
    ]);

        res.status(200).json({ movies: recommendedMovies });
      } catch (error) {
        console.error('Error fetching recommended movies:', error);
        res.status(500).json({ message: 'Server error' });
      }
    };

exports.getPopularMovies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteGenres = user.genres;
    if (!favoriteGenres || favoriteGenres.length === 0) {
      // fallback: return globally popular movies if user has no favorite genres
      const movies = await Movie.find()
        .sort({ popularity: -1, votes: -1 })
        .limit(10);
      return res.json({ movies });
    }

    const genreRegexes = favoriteGenres.map(g => new RegExp(`\\b${g}\\b`, 'i'));

    const movies = await Movie.find({
      $or: genreRegexes.map(regex => ({ genres: regex }))
    })
      .sort({ votes: -1, popularity: -1})
      .limit(10);

    if (movies.length === 0) {
      return res.status(404).json({ message: 'No popular movies found for your favorite genres.' });
    }

    res.json({ movies });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    let movie;

    // If movieId is numeric, search by "id" field
    if (!isNaN(movieId)) {
      movie = await Movie.findOne({ id: parseInt(movieId) });

      if (movie && movie._id) {
        movie = await Movie.findById(movie._id); // Now guaranteed to get full fields
      }
    } else {
      movie = await Movie.findById(movieId);
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
    console.log('Movie data fetched:', movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSimilarMovies = async (req, res) => {
  try {
    // Find the movie by ID first
    const movieId = req.params.id;
    let movie;

    // If movieId is numeric, search by "id" field
    if (!isNaN(movieId)) {
      movie = await Movie.findOne({ id: parseInt(movieId) });

      if (movie && movie._id) {
        movie = await Movie.findById(movie._id);
      }
    } else {
      movie = await Movie.findById(movieId);
    }
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

     const overviewSearch = movie.overview ? movie.overview.substring(0, 500) : '';

    // Build query
    const query = {
      _id: { $ne: movie._id },
      genres: { $in: movie.genres },
      $text: { $search: overviewSearch },
      rating: { $gte: 7, $lte: 9 },  // rating >= movie.rating
      //votes: { $gte: movie.votes }     // votes >= movie.votes
    };
    const similarMovies = await Movie.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
     res.json({ movies: similarMovies });

  } catch (error) {
    console.error('Error fetching similar movies:', error);
    res.status(500).json({ error: 'Server error fetching similar movies' });
  }
};