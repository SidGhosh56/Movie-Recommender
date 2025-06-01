const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const User = require('../models/User');
const Movie = require('../models/Movie');
// Protect all watchlist routes with auth middleware
router.use(auth);

router.get('/', async (req, res) => {
  try {
    // req.user.id contains user ID from JWT
    const user = await User.findById(req.user.id).populate('watchlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movieData = req.body;
    let movie = await Movie.findOne({ id: movieData.id });
    if (!movie) movie = await Movie.create(movieData);

    if (!user.watchlist.some(id => id.equals(movie._id))) {
      user.watchlist.push(movie._id);
      await user.save();
    }
    
    res.json({ message: 'Added to watchlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movie = await Movie.findOne({ _id: req.params.id });
    if (movie) {
      user.watchlist = user.watchlist.filter(id => !id.equals(movie._id));
      await user.save();
      res.json({ message: 'Removed from watchlist' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;