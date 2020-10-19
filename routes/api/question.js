const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require ('passport');

//Load Person Model
const Person = require("../../models/Person");

//Load Profile model
const Profile = require('../../models/Profile');

//Load Question model
const Question = require('../../models/Question');

//type    -    GET
//route   -    /api/questions/
//desc    -    test route for questions
//access  -    PUBLIC
// router.get('/', (req,res) => res.json({
//     questions: 'question posted successfully'
// }));

//type    -    POST
//route   -    /api/questions/
//desc    -    route for submitting questions
//access  -    PRIVATE
router.post('/', passport.authenticate('jwt', 
    { session: false}), 
    (req,res) => {
        const newQuestion = new Question({
            textone: req.body.textone,
            texttwo: req.body.texttwo,
            user: req.user.id,
            name: req.body.name,
        });
        newQuestion
            .save()
            .then( questions => res.json (questions))
            .catch( err => console.log('Unable to push question to DB' +err));
    }
);

//type    -    GET
//route   -    /api/questions/
//desc    -    route for displaying all questions
//access  -    PUBLIC
router.get('/', (req,res) => {
    Question.find()
        .sort({ date: 'desc'})
        .then(questions => {
            res.json(questions);
        })
        .catch(err => res.json({noquestions: 'No questions yet'}));
});

//type    -    POST
//route   -    /api/questions/answers/:id
//desc    -    route for submitting answers to questions
//access  -    PRIVATE
router.post('/answers/:id', passport.authenticate( 'jwt', 
    {session: false}),
    (req, res) => {
        Question.findById(req.params.id)
            .then(questions => {
                const newAnswer = {
                    user: req.user.id,
                    name: req.body.name,
                    text: req.body.text,
                };
            questions.answers.unshift(newAnswer);
            questions.save()
                .then( questions => {
                    res.json(questions)
                })
                .catch(err => console.log(err))
            })
            .catch( err => console.log(err))
    }
)

//type    -    POST
//route   -    /api/questions/upvotes/:id
//desc    -    route for submitting answers to questions, id belongs to the question
//access  -    PRIVATE
router.post('/upvotes/:id', passport.authenticate('jwt', 
{session:false}),
(req,res) => {
    Profile.findOne( {user:req.user.id})
        .then( profile => {
            Question.findById(req.params.id)
                .then( question => {
                    if(question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0){
                        return res.status(400).json( {message: 'Already Upvoted'})
                    }
                    question.upvotes.unshift( {user: req.user.id})
                    question 
                        .save()
                        .then(question => res.json(question))
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));
}

)

module.exports = router;
