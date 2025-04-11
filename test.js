require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("✅ Connected to MongoDB");
    process.exit();
})
.catch((err) => {
    console.error("❌ Failed to connect:", err.message);
    process.exit(1);
});
