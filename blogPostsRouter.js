const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');




//Adding some items to BlogPosts
BlogPosts.create('First post', 'Hello, this is out first post', 'Anna K', '09/09/2017');
BlogPosts.create('Second post', 'Hxknvjdfnvjk', 'Anna S');

//GET
router.get('/', (req, res) => {
	res.json(BlogPosts.get());
});
//POST
router.post('/', jsonParser, (req, res) =>{
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
router.put('/:id', jsonParser, (req, res) => {
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
router.delete('/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleting blog post ${req.params.id}`);
	res.status(204).end();
});

module.exports = router;
