const mongoose = require("mongoose");
const csv = require("csvtojson");
require("dotenv").config();
const Movie = require("./models/Movie"); // you'll need to create this model

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected ✅");

        const movies = await csv().fromFile("./import/project.csv");

        await Movie.insertMany(movies);
        console.log("Movies imported 🎬");

        process.exit(); 
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

connectDB();
