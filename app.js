const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// fix Mongoose Proimise warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', { useNewUrlParser: true })
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.log(err));

// Load Models/Schemas
require('./models/Idea');
const Idea = mongoose.model('ideas');

// usage: nodemon app.js

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser midlleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// override with POST having ?_method=[REQUEST]
app.use(methodOverride('_method'));

// Express session midleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

// Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// index route
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title: title
    });
});

// About Route
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/ideas', (req, res) => {
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
app.post('/ideas', (req, res) => {
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
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
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
app.put('/ideas/:id', (req, res) => {
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

app.delete('/ideas/:id', (req, res) => {
    Idea.deleteOne({_id:req.params.id})
        .then(() => {
            req.flash('success_msg', 'Video idea removed!');
            res.redirect('/ideas');
        });
});

const port = 5000;

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
});