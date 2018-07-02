'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;



const {BlogPost} = require('./models');



//GET
router.get('/', (req, res) => {
	BlogPost.find()
	.then(posts => {
		res.json(posts.map(post => post.serialize()));
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"});
	});
});

// GET by id
router.get('/:id', (req, res) => {
	BlogPost
	.findById(req.params.id)
	.then(blogpost => res.json(blogpost.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"})
	})

})

//POST
router.post('/', (req, res) =>{
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
	BlogPost.create({
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate
	})
	.then(post => res.status(201).json(post.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"});
	});
});

//PUT
router.put('/:id', (req, res) => {
//ensure that blog id in url path and req match
	if (req.params.id !== req.body.id) {
		const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
		console.error(message);
		return res.status(400).json({message: message});
	}
	const toUpdate = {};
	const updatableFields = ['title', 'content', 'author'];

	updatableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPost.findByIdAndUpdate(req.params.id, {$set: toUpdate}, { new: true })
	.then(post => res.status(204).end())
	.catch(err => {
		console.error(err);
		res.status(500).json({message: "Internal server error"})
	});

});

// DELETE
router.delete('/:id', (req, res) => {
	BlogPost.findByIdAndRemove(req.params.id)
	.then(post => {
		res.status(204).end();
	})
	.catch(err => res.status(500).json({message: "Internal server error"}))
});

module.exports = router;
