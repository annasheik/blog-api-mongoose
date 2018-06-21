const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Blog Posts', function() {
	before(function() {
		return runServer();
	});
	after(function() {
		return closeServer();
	});

	//GET test
	//1. make get request to '/blog-posts'
	//2. inspect res obj to make sure it has right status code 200 and right keys
	it('should list blog posts on GET', function() {
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.be.a('array');
			expect(res.body.length).to.be.at.least(1);
			const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
			res.body.forEach(function(item) {
				expect(item).to.be.a('object');
				expect(item).to.include.keys(expectedKeys);
			});
		});
	});

	//POST test
	//1.make post req with data for a new blog post
	//2. inspect res obj to have right status 201 and id
	it('should add new blog post on POST', function() {
		const newBlogPost = {title: 'test', content: "dnvhdvnsd", author: 'Anna'};
		return chai.request(app)
		.post('/blog-posts')
		.send(newBlogPost)
		.then(function(res) {
			expect(res).to.have.status(201);
			expect(res).to.be.json;
			expect(res.body).to.be.a('object');
			expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
			expect(res.body.id).to.not.equal(null);
			expect(res.body).to.deep.equal(Object.assign(newBlogPost, {id:res.body.id, publishDate: res.body.publishDate}));
		});
	});

	//PUT test
	//1.initialize some update date without id
	//2. make Get req so we can get an item to update
	//3. add the id to updateData
	//4. Make put req with updateData
	//5. inspect the res status to be 204
	it('should update blog post on PUT', function() {
		const updateBlog = {
			title: "test",
			content: "fkngf",
			author: "Anna"
		};
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			updateBlog.id = res.body[0].id;
			return chai.request(app)
				.put(`/blog-posts/${updateBlog.id}`)
				.send(updateBlog);
		})
		.then(function(res) {
			expect(res).to.have.status(204);
		});
	});

	// DELETE test
	//1. Make Get req so we can get 1 blog post id to delete
	//2. send DELETE req and make sure we get back status 204
	it('should delete blog post on DELETE', function() {
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			return chai.request(app)
			.delete(`/blog-posts/${res.body[0].id}`)
		})
		.then(function(res) {
			expect(res).to.have.status(204);
		});
	});


	
});