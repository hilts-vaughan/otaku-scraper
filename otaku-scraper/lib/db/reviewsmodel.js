/*
	Defines our schema and interactive model for anime reviews
	This is a mongoose defined model.
*/
mongoose = require('mongoose');

var reviewsSchema = mongoose.Schema({
	mal_id: Number,
	expiry: Date,
	reviews: []
});

var ReviewsModel = mongoose.model('ReviewsModel', reviewsSchema);

module.exports = ReviewsModel;