// const fs = require('fs');
// const https = require("https");
// const cors = require('cors');
const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());


const posts = [
    { id: 1, title: 'post1', date: '', img: '/img/gratitudetoken.jpg', content: '<h1>1 The standard Lorem Ipsum passage, used since the 1500s</h1> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'},
    { id: 2, title: 'post1', date: '', img: '/img/gratitudetoken.jpg', content: '<h1>2 The standard Lorem Ipsum passage, used since the 1500s</h1> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'},
    { id: 3, title: 'post1', date: '', img: '/img/gratitudetoken.jpg', content: '<h1>3 The standard Lorem Ipsum passage, used since the 1500s</h1> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
];

app.get('/posts', (req, res) => {
    // req.params ? res.send(req.params) : null;
    // req.query ? res.send(req.query) : null;
    res.send(posts);
});

// app.get('/posts/:day/:month/:year', (req, res) => {
//     res.send(req.params); // Example: domain.com/posts/2018/1/1
//     //res.send(req.query); // Example: domain.com/posts/2018/1/1?sortBy=title
// });

app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) res.status(404).send('The post with the given title was not found.'); // 404
    res.send(post);
});

app.post('/posts', (req, res) => {
    const { error } = ValidatePost(req.body); // object destructuring
    if (error) {
        // 400 bad requests
        res.status(400).send(error.details[0].message);
        return;
    }

    const post = {
        id: posts.length + 1,
        title: req.body.title,
        date: req.body.date,
        img: req.body.img,
        content: req.body.content
    }

    posts.push(post);
    res.send(post);
});

app.put('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) res.status(404).send('The post with the given title was not found.'); // 404

    const { error } = ValidatePost(req.body); // object destructuring
    if (error) {
        // 400 bad requests
        res.status(400).send(error.details[0].message);
        return;
    }
    post.title = req.body.title;

    res.send(post);
    // 4
});

function ValidatePost(post) {
    let customValidation = (value, helpers) => {
        let index;
        posts.map(function (post) {
            console.log(post); // you have to get the key, not the value, dumbass
            console.log(value);
            // if (????? === value) {
            //     throw new Error('NOT UNIQUE');
            // }
        });
    }
    const schema = Joi.object({
        title: Joi.string().alphanum().min(3).max(230).required().custom(customValidation, 'Custom Stuff'),
        date: Joi.date().iso().required(),
        img: Joi.string().min(6).max(230).required(),
        content: Joi.string().min(23).max(2030).required(),
    });
    return schema.validate(post);
}

//app.delete();

// PORT
const port = process.env.PORT || 3333;

app.listen(port, () => console.log(`Listening on port ${port}`));


// app.use(cors());

// https
//   .createServer(
//     {
//       key: fs.readFileSync("server.key"),
//       cert: fs.readFileSync("server.crt"),
//     },
//     app
//   )
//   .listen(3333, () => {
//     console.log("Server is running at port 3333");
//   });






// REMEMBER TO ALSO SAVE EVERY NEW ARTICLE URL to the SITEMAP?









// app.post('/posts/:id', (req, res) => {
//     const post = posts.find(p => p.id === parseInt(req.params.id));
//     if (!post) res.status(404).send('The post with the given title was not found.'); // 404

//     const { error } = ValidatePost(req.body); // object destructuring
//     if (error) {
//         // 400 bad requests
//         res.status(400).send(error.details[0].message);
//         return;
//     }

//     // Update course
//     // Return the updated course
//     post.title = req.body.title;

//     posts.push(post);
//     res.send(post);
// });