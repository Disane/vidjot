const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
// Load Helper Middleware
const {ensureAuthenticated} = require('../helpers/auth');


// Load Models/Schemas
require('../models/Idea');
const Idea = mongoose.model('ideas');

router.get('/', ensureAuthenticated, (req, res) => {
    // get all Idea entries from the DB
    Idea.find({})
        .sort({date:'desc'})
        .then(ideas => {
            res.render('ideas/index', {
                ideas:ideas
            });
        });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    
    if(!req.body.title){
        errors.push({text:'Pleas add a title'});
    }
    if(!req.body.details){
        errors.push({text:'Pleas add some details'});
    }

    if(errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details
        };
        new Idea(newUser)
            .save()
            .then( () => {
                req.flash('success_msg', 'Video idea added!');
                res.redirect('/ideas');
            });
    }
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then( idea => {
        res.render('ideas/edit', {
            idea: idea
        });
    });
});

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    }).then(idea => {
        // new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
            .then(idea => {
                req.flash('success_msg', 'Video idea edited!');
                res.redirect('/ideas');
            });
    });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.deleteOne({_id:req.params.id})
        .then(() => {
            req.flash('success_msg', 'Video idea removed!');
            res.redirect('/ideas');
        });
});

module.exports = router;