const express = require('express');
const router = express.Router();
const mongoos = require('mongoose');
const passport = require('passport');
const { route } = require('./auth');
//Load Person Model
const Person = require("../../models/Person");

//Load Profile model
const Profile = require('../../models/Profile');

//type    -    GET
//route   -    /api/profile
//desc    -    route for individual profile of users
//access  -    PRIVATE
router.get('/', 
    passport.authenticate('jwt', {session: false}), 
    (req,res) => {
        Profile.findOne( {user: req.user.id} )
            .then( profile => {
                if(!profile){
                    return res.status(404).json( {profileNotFound: 'User profile not found'})
                }
                res.json(profile)
            })
            .catch(err => console.log('ERROR IN profile.js' +err));
    })

//type    -    POST
//route   -    /api/profile/
//desc    -    route for SAVING/UPDATING individual profile of users
//access  -    PRIVATE
router.post(
    '/',
    passport.authenticate('jwt', {session:false}),
    (req,res) => {
        //COLLECT THE DATA
        const profileValues = {};
        profileValues.user = req.user.id;
        if( req.body.username) profileValues.username = req.body.username;
        if(req.body.website) profileValues.website = req.body.website;
        if(req.body.country) profileValues.country = req.body.country;
        if(req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if(typeof req.body.languages !== undefined)
        {
            profileValues.languages = req.body.languages.split(',');
        }
        //GETTING SOCIAL LINKS
        profileValues.social = {};
        if(req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if(req.body.instagram) profileValues.social.instagram = req.body.instagram;
    
        //DATABASE HANDLING
        Profile.findOne( {user: req.user.id})
            .then( profile => {
                if(profile) {
                    Profile.findOneAndUpdate( 
                        { user: req.user.id },
                        { $set: profileValues },
                        { new: true },
                    ) .then( profile => res.json(profile)).catch(err => console.log('problem in updation') +err)
                } else {
                    Profile.findOne({ username: profileValues.username})
                        .then(profile => {
                            //username already exists
                            if(profile){
                                res.status(400).json( { username: 'Username already exists'})
                            }
                            //save user
                            new Profile(profileValues).save()
                                .then(profile => {
                                    res.json(profile);
                                }) 
                                .catch( err => console.log(err));
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch( err => console.log('Problem in fetching profile' + err))
    }
);

//type    -    GET
//route   -    /api/profile/:username
//desc    -    route for getting user profile based on username
//access  -    PUBLIC
router.get('/:username', (req,res) => {
    Profile.findOne({username: req.params.username})
        .populate('user', ['name','profilepic'])
        .then(profile => {
            if(!profile){
                res.status(404).json( {usernNotFound: 'user not found'})
            }
            res.json(profile);
        })
        .catch( err => console.log('Error in fetching username' +err));
});//similarly can be done for id

//type    -    GET
//route   -    /api/profile/find/everybody
//desc    -    route for getting user profile of every user 
//access  -    PUBLIC
router.get('/find/everybody', (req,res) => {
    Profile.find()
        .populate('user', ['name','profilepic'])
        .then(profiles => {
            if(!profiles){
                res.status(404).json( {usernNotFound: 'no profile found'})
            }
            res.json(profiles);
        })
        .catch( err => console.log('Error in fetching username' +err));
});

//type    -    DELETE
//route   -    /api/profile/
//desc    -    route for deleting user based on ID
//access  -    PRIVATE
router.delete('/', passport.authenticate('jwt', {session: false}),
    (req,res)=> {
        Profile.findOne( {user: req.user.id} )
        Profile.findOneAndRemove( {user: req.res.id } )
            .then(()=> {
                Person.findOneAndRemove( {_id: req.user.id})
                .then( () => res.json( {success: 'delete successful'}))
                .catch(err => console.log(err));
            })
            .catch( err => console.log(err));
    }
    );

//type    -    POST
//route   -    /api/profile/workRole
//desc    -    route for adding workrole profile of individual users
//access  -    PRIVATE
router.post('/workRole', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne( {user: req.user.id})
        .then( profile => {
            if(!profile){
                res.status(404).json( {profileNotFound: 'Profile not found'});
            }
            const newWorkRole = {
                role: req.body.role,
                company: req.body.company,
                country: req. body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details,
            }
            profile.workRole.unshift(newWorkRole);
            profile.save()
                .then( profile => res.json(profile))
                .catch( err => console.log(err))
        })
        .catch( err => console.log(err) );
})

//type    -    DELETE
//route   -    /workRole/:w_id
//desc    -    route for deleting workrole profile of individual users
//access  -    PRIVATE
router.delete( '/workRole/:w_id', passport.authenticate ('jwt', {session:false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then( profile => {
            if(!profile){
                res.status(404).json( {profileNotFound: `PROFILE NOT FOUND`})
            }
            const removethis = profile.workRole
                .map(item => item.id) //grabbing all the ids
                .indexOf(req.params.w_id);

                profile.workRole.splice(removethis, 1);
                profile.save()
                    .then( profile => res.json(profile))
                    .catch( err => console.log(err))
        })
        .catch( err => console.log(err));
});

module.exports = router;