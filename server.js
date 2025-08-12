var http = require('http');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


app.get('/', (req, res) => {
  res.send('Hello World');
});




app.listen(process.env.port , () => {
  console.log(`Example app listening at http://localhost:${process.env.port}`);
});


/*http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello Worlddsdsds\n');
}).listen(3000);*/
const userRoutes = require('./routes/UserRoute');
app.use('/users', userRoutes);
app.use('/uploads', express.static('uploads'));
const offerRoutes = require('./routes/OfferRoute');
app.use('/offers', offerRoutes);
const applicationRoutes = require('./routes/ApplicationRoute');
app.use('/applications', applicationRoutes);