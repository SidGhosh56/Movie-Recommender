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
    const filter = {
      votes: { $gte: 400 },
      rating: { $gte: 7.5 }
    };

    const count = await Movie.countDocuments(filter);

    if (count === 0) {
      return res.status(404).json({ error: "No suitable movies found" });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const randomMovie = await Movie.findOne(filter).skip(randomIndex);

    if (!randomMovie) {
      return res.status(404).json({ error: "Random movie not found" });
    }

    res.json(randomMovie);
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
    const genreRegexes = genres.map(g => new RegExp(`\\b${g}\\b`, 'i'));

    const movies = await Movie.find({ 
      $or: genreRegexes.map(regex => ({ genres: regex })),
      votes: { $gte: 100 } 
    })
    .sort({ rating: -1, votes: -1 })  // prioritize high-rated and well-voted
    .limit(10);  // you can increase from 10 to 20 if needed for UI

    if (movies.length === 0) {
      return res.status(404).json({ message: 'No movies found for selected genres.' });
    }

    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Simple similarity checker (for overview text)
function getOverviewScore(overview, favOverviews) {
  if (!overview) return 0;
  overview = overview.toLowerCase();
  let score = 0;
  favOverviews.forEach(fav => {
    if (overview.includes(fav.toLowerCase().split(' ').slice(0, 5).join(' '))) {
      score++;
    }
  });
  return score;
}

exports.getRecommendedByGenres = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteMovies');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteGenres = user.genres;
    if (!favoriteGenres || favoriteGenres.length === 0) {
      return res.status(200).json({ movies: [] }); // No genres, no recs
    }

    const favoriteOverviews = user.favoriteMovies
      .filter(m => m.overview)
      .map(m => m.overview);

    const m = 50; // minimum votes
    const CResult = await Movie.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    const C = CResult[0]?.averageRating || 0;

    const genreRegexes = favoriteGenres.map(g => new RegExp(`\\b${g}\\b`, 'i'));

    const initialMovies = await Movie.aggregate([
      {
        $match: {
          $or: genreRegexes.map(regex => ({ genres: regex })),
          votes: { $gte: m },
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
      }
    ]);

    // Add overview similarity score
    const finalScored = initialMovies.map(movie => {
      const overviewScore = getOverviewScore(movie.overview, favoriteOverviews);
      const finalScore = movie.weightedRating + overviewScore * 0.1; // Adjust weight as needed
      return { ...movie, finalScore };
    });

    // Sort by final score (descending)
const sorted = finalScored.sort((a, b) => b.finalScore - a.finalScore);

// Randomize top 50, then slice 10
const shuffled = sorted.slice(0, 50).sort(() => Math.random() - 0.5).slice(0, 10);

res.status(200).json({ movies: shuffled });
    
  } catch (error) {
    console.error('Error fetching recommended movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTopRated = async (req, res) => {
  try {
    const topRatedMovies = await Movie.find({ rating: { $gte: 7.5 }, votes: { $gte: 300 } })
                                      .sort({ rating: -1 })
                                      .limit(10);
    res.status(200).json({ movies: topRatedMovies });
  } catch (err) {
    console.error('Error fetching top-rated movies:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteMovies');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteGenres = user.genres || [];
    const favoriteOverviews = user.favoriteMovies
      .filter(m => m.overview)
      .map(m => m.overview);

    let movies;

    if (favoriteGenres.length === 0) {
      movies = await Movie.find().sort({ votes: -1 }).limit(100); // fetch more to allow overview scoring
    } else {
      const genreRegexes = favoriteGenres.map(g => new RegExp(`\\b${g}\\b`, 'i'));
      movies = await Movie.find({
        $or: genreRegexes.map(regex => ({ genres: regex }))
      })
        .sort({ votes: -1, popularity: -1 })
        .limit(100); // fetch more to filter later
    }

    // Add overview-based score
    const scoredMovies = movies.map(movie => {
      const overviewScore = getOverviewScore(movie.overview, favoriteOverviews);
      const finalScore = (movie.votes || 0) + (movie.popularity || 0) + overviewScore * 10;
      return { ...movie._doc, finalScore }; // `_doc` to include regular object fields
    });

    // Sort by finalScore and take top 24
    const finalSorted = scoredMovies
  .sort((a, b) => b.finalScore - a.finalScore);

// Randomize top 30 and select 24
const randomized = finalSorted.slice(0, 50).sort(() => Math.random() - 0.5).slice(0, 24);

if (randomized.length === 0) {
  return res.status(404).json({ message: 'No popular movies found for your favorite genres.' });
}

res.json({ movies: randomized });

  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMostVoted = async (req, res) => {
  try {
    const popularByVotes = await Movie.find({ votes: { $gte: 50 } }) // you can tweak this threshold
                                     .sort({ votes: -1 })
                                     .limit(24);
    res.status(200).json({ movies: popularByVotes });
  } catch (error) {
    console.error('Error fetching most voted movies:', error);
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

     const overviewSearch = movie.overview ? movie.overview.substring(0, 5000) : '';

    // Build query
    const query = {
      _id: { $ne: movie._id },
      $text: { $search: `${movie.title} ${overviewSearch}` },
      rating: { $gte: 7, $lte: 9 }
    };

    const candidates = await Movie.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .lean();

    const inputGenres = movie.genres || [];

   const genreFiltered = candidates.filter(candidate => {
    const candidateGenres = candidate.genres || [];
    const commonGenres = inputGenres.filter(g => candidateGenres.includes(g));

    if (candidateGenres.length <= 1) {
      return commonGenres.length >= 1;
    } else {
      return commonGenres.length >= 2;
    }
  });
    // Boost scores based on similarity factors
    const boosted = genreFiltered.map(candidate => {
      let boost = candidate.score || 0;
 // Director match
      if (candidate.director === movie.director) {
        boost += 10;
      }

      // Higher or equal vote count
      if (candidate.votes && movie.votes && candidate.votes >= movie.votes) {
        boost += 2;
      }

      // Title similarity (word overlap)
      const stopWords = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'with', 'to', 'from', 'by']);
      const titleWords = movie.title.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word));
      const candidateTitle = (candidate.title || "").toLowerCase();

      let titleOverlap = 0;
      titleWords.forEach(word => {
        if (candidateTitle.includes(word)) titleOverlap += 1;
      });
      boost += titleOverlap * 3;

      return { ...candidate, score: boost };
    });

    // Final top 10
    const topMovies = boosted.sort((a, b) => b.score - a.score).slice(0, 10);

    res.json({ movies: topMovies });

  } catch (error) {
    console.error('Error fetching similar movies:', error);
    res.status(500).json({ error: 'Server error fetching similar movies' });
  }
};

exports.getTopMovies = async (req, res) => {
    try {
        const movies = await Movie.find({})
            .sort({ votes: -1 })
            .limit(20)
            .select('title poster_url year rating votes popularity'); // selecting the needed fields

        const response = movies.map(movie => ({
            id: movie.id || movie._id,  
            title: movie.title,
            poster_url: movie.poster_url || 'default_poster.jpg',
            year: movie.year || 'N/A',
            rating: movie.rating !== undefined ? movie.rating.toFixed(1) : 'N/A' // format rating nicely
        }));
        res.json({ top_movies: response });
    } catch (err) {
        console.error('Error fetching top movies:', err);
        res.status(500).json({ error: 'Failed to fetch top movies.' });
    }
};

exports.rateMovie = async (req, res) => {
  const { rating } = req.body;
  const { id: movieId } = req.params;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 10.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update or add rating
    const existing = user.ratings.find(r => r.movieId.toString() === movieId);

    if (existing) {
      existing.rating = rating;
      existing.ratedAt = new Date();
    } else {
      user.ratings.push({ movieId, rating });
    }

    await user.save();

    res.json({ message: 'Your rating has been saved.', rating });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserRating = async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.ratings || user.ratings.length === 0) {
      return res.status(200).json({ rating: null });
    }
    
    const ratingEntry = user.ratings.find(r => r.movieId.toString() === movieId);
    if (!ratingEntry) {
      return res.status(200).json({ rating: null });
    }

    res.status(200).json({ rating: ratingEntry.rating });
  } catch (err) {
    console.error('Error fetching user rating:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTrendingMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ votes: -1 }).limit(10);
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching trending movies" });
  }
};

exports.getNewMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ year: -1 }).limit(10);
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching new movies" });
  }
};

exports.getRecommendedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ rating: { $ne: null }, votes: { $ne: null } });

    const topRecommended = movies
      .map(movie => {
        // Simple combined score without normalization
        const score = ((movie.votes || 0))/25000 + (movie.rating || 0) ;
        return { ...movie._doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({ movies: topRecommended });
  } catch (err) {
    console.error('Error fetching recommended movies:', err);
    res.status(500).json({ message: "Error fetching recommended movies" });
  }
};
