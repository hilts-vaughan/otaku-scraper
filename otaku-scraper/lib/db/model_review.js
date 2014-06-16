/*
	Defines our schema and interactive model for anime reviews
	This is a mongoose defined model.
*/
var mongoose = require('mongoose')
  ;

var reviewsSchema = mongoose.Schema({
	mal_id: Number,
	expiry: Date,
	reviews: []
});

var reviewsModel = function(type) {
	return mongoose.model(type + 'ReviewsModel', reviewsSchema);
};

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = reviewsModel;
}