const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');



const port = process.env.PORT || 3000;

//get all routes
const auth = require('./routes/api/auth.js');
const question = require('./routes/api/question');
const profile = require('./routes/api/profile');


const app = express();

//MIDDLEWARE FOR BODY-PARSER
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//mongoDB configuration
const db = require('./setup/myurl').mongoURL //setup in myurl

//CONNECTION TO mongoDB
mongoose
    .connect(db) //don't put semicolon
        .then(() => console.log('MongoDB connected suuccessfully')) //don't put semicolon
            .catch(err => {
                return console.log(err);
            });

//PASSPORT MIDDLEWARE
app.use(passport.initialize());

//CONFIG FOR JWT strategy
require('./strategies/jsonWTStrategy')(passport)

//route for testing purpose
// app.get('/', (req,res) => {
//     res.send('Hey there Big stack')
// });

//ACTUAL ROUTES
app.use('/api/auth', auth);
app.use('/api/questions', question);
app.use('/api/profile',profile);


app.listen(port, () =>console.log(`APP IS RUNNING ON ${port}`));