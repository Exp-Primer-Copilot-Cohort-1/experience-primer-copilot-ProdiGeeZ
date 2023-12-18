// Create web server
var express = require('express');
var router = express.Router();
// Load Comment model
var Comment = require('../models/comment');
// Load User model
var User = require('../models/user');
// Load Post model
var Post = require('../models/post');
// Load middleware
var middleware = require('../middleware');

// Comments New
router.get('/posts/:id/comments/new', middleware.isLoggedIn, function(req, res) {
	// Find post by id
	Post.findById(req.params.id, function(err, post) {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', { post: post });
		}
	});
});

// Comments Create
router.post('/posts/:id/comments', middleware.isLoggedIn, function(req, res) {
	// Lookup post using ID
	Post.findById(req.params.id, function(err, post) {
		if (err) {
			console.log(err);
			res.redirect('/posts');
		} else {
			// Create new comment
			Comment.create(req.body.comment, function(err, comment) {
				if (err) {
					req.flash('error', 'Something went wrong');
					console.log(err);
				} else {
					// Add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// Save comment
					comment.save();
					// Connect new comment to post
					post.comments.push(comment);
					post.save();
					// Redirect to post show page
					req.flash('success', 'Successfully added comment');
					res.redirect('/posts/' + post._id);
				}
			});
		}
	});
});

// Comments Edit
router.get('/posts/:id/comments/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if (err) {
			res.redirect('back');
		} else {
			res.render('comments/edit', { post_id: req.params.id, comment: foundComment });
		}
	});
});

// Comments Update
router.put('/posts/:id/comments/:comment_id', middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
		if (err) {
			res.redirect('back');
		}
    });
});