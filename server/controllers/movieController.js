const Movie = require("../models/Movie");

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

exports.getMoviesByGenre = async (req, res) => {
  try {
    const genresQuery = req.query.genres;
    if (!genresQuery) {
      return res.status(400).json({ error: 'Genres query parameter is required' });
    }

    const genres = genresQuery.split(',').map(g => new RegExp(`^${g.trim()}$`, 'i'));

    // Find movies whose 'genres' field contains any of the selected genres
    const movies = await Movie.find({ genres: { $in: genres } })
                              .sort({ rating: -1 , popularity: -1, votes: -1})   // descending order by rating
                              .limit(10);

    if (movies.length === 0) {
      return res.status(404).json({ message: 'No movies found for selected genres.' });
    }

    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
