const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");

const fixMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    const movies = await Movie.find();

    let updatedCount = 0;

    for (const movie of movies) {
      if (typeof movie.genres === "string") {
        const genresArray = movie.genres.split(",").map((g) => g.trim());

        // Direct MongoDB update:
        await Movie.updateOne(
          { _id: movie._id },
          { $set: { genres: genresArray } }
        );

        console.log(`✅ Updated genres for ${movie.title}`);
        updatedCount++;
      }
    }

    console.log(`All done! ✅ ${updatedCount} movies updated.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating genres:", error);
    process.exit(1);
  }
};

fixMovies();
