const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();
//log the HTTP requests
app.use(morgan('common'));

//Adding some items to BlogPosts
BlogPosts.create('First post', 'Hello, this is out first post', 'Anna K', '09/09/2017');
BlogPosts.create('Second post', 'Hxknvjdfnvjk', 'Anna S');

//GET
app.get('/blog-posts', (req, res) => {
	res.json(BlogPosts.get());
});
//POST
app.post('/blog-posts', jsonParser, (req, res) =>{
// ensure all the fields are in req body
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i< requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` field`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	const post = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
	console.log(`Creating new blog post \`${req.body.title}\``)
	res.status(201).json(post);
});

//PUT
app.put('/blog-posts/:id', jsonParser, (req, res) => {
// ensure the req has required fields
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message)
		}
	}
//ensure that blog id in url path and req match
	if (req.params.id !== req.body.id) {
		const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
		console.error(message);
		return res.status(400).send(message);
	}
// if everything ok, the post will be updated
	console.log(`Updating blog post ${req.params.id}`);
	BlogPosts.update({
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate || Date.now()
	})
	res.status(204).end();
});

// DELETE
app.delete('/blog-posts/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleting blog post ${req.params.id}`);
	res.status(204).end();
});




app.listen(process.env.PORT || 8080, () => {
	console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});