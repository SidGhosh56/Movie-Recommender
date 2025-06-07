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
    console.log('[GET watchlist] User watchlist IDs:', user.watchlist.map(m => m._id));
    console.log('[GET watchlist] Watchlist titles:', user.watchlist.map(m => m.title));
    res.json(user.watchlist);
  } catch (err) {
    console.error('[GET watchlist] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movieData = req.body;
    console.log('[POST watchlist] Incoming movie data:', movieData);

    let movie = await Movie.findOne({ id: movieData.id });
    if (!movie) {
      movie = await Movie.create(movieData);
      console.log('[POST watchlist] Created new movie:', movie);
    } else {
      console.log('[POST watchlist] Found existing movie:', movie);
    }

    if (!user.watchlist.some(id => id.equals(movie._id))) {
      user.watchlist.push(movie._id);
      await user.save();
      console.log('[POST watchlist] Updated user watchlist:', user.watchlist);
    } else {
      console.log('[POST watchlist] Movie already in watchlist');
    }
    
    res.json({ message: 'Added to watchlist' });
  } catch (err) {
    console.error('[POST watchlist] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('[DELETE watchlist] Movie id to remove:', req.params.id);

    const movie = await Movie.findOne({ _id: req.params.id });
    if (movie) {
      user.watchlist = user.watchlist.filter(id => !id.equals(movie._id));
      await user.save();
      console.log('[DELETE watchlist] Updated user watchlist:', user.watchlist);
      res.json({ message: 'Removed from watchlist' });
    } else {
      console.log('[DELETE watchlist] Movie not found');
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (err) {
    console.error('[DELETE watchlist] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;