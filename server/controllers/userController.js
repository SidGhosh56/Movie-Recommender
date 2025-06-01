const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const { fullName, bio, genres, dob } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, bio, genres, dob },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    const { password, ...userData } = updatedUser.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.addWatchedMovie = async (req, res) => {
  const { movieId } = req.body;
  const userId = req.user.id; // get user from auth middleware

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.watchedMovies.includes(movieId)) {
      user.watchedMovies.push(movieId);
      await user.save();
    }

    res.json({ message: 'Movie added to watched list' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.removeWatchedMovie = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.watchedMovies = user.watchedMovies.filter(id => id.toString() !== movieId);
    await user.save();

    res.json({ message: 'Movie removed from watched list' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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
