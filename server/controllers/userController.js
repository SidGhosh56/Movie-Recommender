const User = require('../models/User');
const Movie = require('../models/Movie'); 

exports.updateProfile = async (req, res) => {
  const { fullName, bio, genres, dob } = req.body;

  try {
    const updateFields = {};

    if (fullName) updateFields.fullName = fullName;
    if (bio !== undefined) updateFields.bio = bio;
    if (genres && Array.isArray(genres)) updateFields.genres = genres;

    // Ensure dob is valid before updating
    if (dob && dob.day && dob.month && dob.year) {
      updateFields.dob = {
        day: Number(dob.day),
        month: Number(dob.month),
        year: Number(dob.year),
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    // Exclude password from response
    const { password, ...userData } = updatedUser.toObject();
    res.json(userData);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.addWatchedMovie = async (req, res) => {
  const { movieId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the actual movie document
    const movie = await Movie.findOne({ id: movieId });  // use your TMDb id field here
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found in database' });
    }

    const alreadyWatched = user.watchedMovies.some(
      entry => entry.movieId && entry.movieId.toString() === movie._id.toString()
    );

    if (!alreadyWatched) {
      user.watchedMovies.push({
        movieId: movie._id,   // push correct ObjectId
        watchedAt: new Date()
      });
      await user.save();
      return res.json({ message: 'Movie added to watched list' });
    }

    res.json({ message: 'Movie already in watched list' });

  } catch (error) {
    console.error('Error adding watched movie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.removeWatchedMovie = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.watchedMovies = user.watchedMovies.filter(
      entry => entry.movieId.toString() !== movieId
    );
    await user.save();

    res.json({ message: 'Movie removed from watched list' });
  } catch (error) {
    console.error('Error removing watched movie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWatchedMovies = async (req, res) => {
  const userId = req.user.id;

  try {
    // Populate movieId in watchedMovies
    const user = await User.findById(userId).populate('watchedMovies.movieId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const watchedMovies = user.watchedMovies
      .sort((a, b) => b.watchedAt - a.watchedAt)
      .map((entry) => {
        const movie = entry.movieId;  // populated movie document

        // Check if movie exists (not null)
        if (!movie) return null;

        return {
          id: movie._id,
          title: movie.title,
          poster_url: movie.poster_url,
          year: movie.year,
          rating: movie.rating,
          watchedAt: entry.watchedAt
        };
      })
      .filter(m => m !== null);  // filter out null entries (missing movies)

    res.json({ movies: watchedMovies });
  } catch (error) {
    console.error('Error getting watched movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.savePreferences = async (req, res) => {
  const { favoriteGenres, favoriteMovies } = req.body;
  const userId = req.user.id;

  if (!userId || !favoriteGenres || !favoriteMovies) {
    return res.status(400).json({ message: 'Missing required data' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        genres: favoriteGenres,
        favoriteMovies: favoriteMovies
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Preferences saved successfully', user: updatedUser });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteMovies watchedMovies watchlist');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, ...userData } = user.toObject(); // exclude password
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};