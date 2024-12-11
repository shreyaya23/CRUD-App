//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { compile } = require('ejs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', ()=> console.log("Connected to database!"));

//middlewares 
app.use(express.urlencoded({ extended : false}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: "your_secret_key", // Replace with a strong secret key
        resave: false,
        saveUninitialized: true,
    })
);

app.use((req, res, next) => {
    res.locals.messages = res.locals.messages;
    delete res.locals.messages;
    next();
});

//set template engine
app.set("view engine", "ejs");

//route prefix
app.use("", require("./routes/routes"));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
