const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const movieRoutes = require("./routes/movieRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/movies", movieRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/cinevortex', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send('Backend running...');
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
