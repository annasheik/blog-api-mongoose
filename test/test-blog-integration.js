'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models');
const {TEST_DATABASE_URL} = require('../config')

const expect = chai.expect;
chai.use(chaiHttp);

//Create 10 random documents to put in database
function seedBlogPostData() {
	console.info('Seeding blog post data');
	const seedData = [];

	for (let i=1; i<=10; i++) {
		seedData.push(generateBlogPostData());
	}
	return BlogPost.insertMany(seedData);
}

function generateBlogPostData() {
	return {
		title: faker.random.word(),
		content: faker.lorem.paragraph(),
		author: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName()
		},
		publishDate: faker.date.past()
	};
}
// function to delete entire database
function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

//API tests
describe('Blog Posts API resource', function() {
	before(function () {
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(function() {
		return seedBlogPostData();
	});
	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer()
	});

	//GET 
	describe('GET endpoint', function() {
		it('should return all existing blog posts', function() {
			//strategy:
			//	1.Get back all blog posts returned by GET req to /posts
			//	2.Prove res has status 200 and right data type
			//	3.Prove the number of blog posts we get back is equal to num in db.

			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res.body).to.have.lengthOf.at.least(1);
				return BlogPost.count();
			})
			.then(function(count) {
				expect(res.body).to.have.lengthOf(count);
			});

		});
			it('should return blogposts with right fields', function() {
				let resPost;
				//strategy:
				//get back all blogposts and ensure they have right keys
				return chai.request(app)
				.get('/posts')
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.a('array');
					expect(res.body).to.have.lengthOf.at.least(1);

					res.body.forEach(function(blogpost) {
						expect(blogpost).to.be.a('object');
						expect(blogpost).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
					});
					resPost = res.body[0];
					return BlogPost.findById(resPost.id)
					})
				.then(function(blogpost) {
					expect(resPost.id).to.equal(blogpost.id);
					expect(resPost.title).to.equal(blogpost.title);
					expect(resPost.content).to.equal(blogpost.content);
					expect(resPost.author).to.contain(blogpost.author.firstName);
					
				});
			});
	});
	describe('POST endpoint', function() {
		//strategy:
		//1.Make a POST req with data
		//2.Probe the blogpost we get back has right keys
		//3. Prove it has id
		it('should add a new blogpost', function() {
			const newPost = generateBlogPostData();
			return chai.request(app)
			.post('/posts')
			.send(newPost)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
				expect(res.body.id).to.not.be.null;
				expect(res.body.title).to.equal(newPost.title);
				expect(res.body.content).to.equal(newPost.content);
				return BlogPost.findById(res.body.id)
			})
			.then(function(post) {
				expect(post.title).to.equal(newPost.title);
				expect(post.content).to.equal(newPost.content);
				expect(post.author.firstName).to.equal(newPost.author.firstName);
				expect(post.author.lastName).to.equal(newPost.author.lastName);
			});
		});
	});
	describe('PUT endpoint', function() {
		//Strategy:
		//1.Get an existing blogpost from db
		//2.Make a put req to update it
		//3. Inspect the updated blogpost to make sure it was updated correctly
		it('should update blogpost on PUT', function() {
			const updatePost = {
				title: "All",
				content: "ANNA ANNA",
				author: {
					firstName: "Anna",
					lastName: "Anna"
				}
			};
			return BlogPost
			.findOne()
			.then(function(post) {
				updatePost.id = post.id;
				return chai.request(app)
				.put(`/posts/${post.id}`)
				.send(updatePost)
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return BlogPost.findById(updatePost.id);
			})
			.then(function(post) {
				expect(post.title).to.equal(updatePost.title);
				expect(post.author.firstName).to.equal(updatePost.author.firstName);
			});
		});
	});
	describe('DELETE endpoint', function() {
		//strategy:
		//1. get a blogpost
		//2. make a DELETE  req for that blogpost id
		//3. make sure res has status code 204
		//4. prove that db with that id doesn't exist in db anymore
		it('should delete item on DELETE', function() {
			let blogpost;
			return BlogPost
			.findOne()
			.then(function(_blogpost) {
				blogpost= _blogpost;
				return chai.request(app)
				.delete(`/posts/${blogpost.id}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return BlogPost.findById(blogpost.id)
			})
			.then(function(_blogpost) {
				expect(_blogpost).to.be.null;
			});
		});
	});
})