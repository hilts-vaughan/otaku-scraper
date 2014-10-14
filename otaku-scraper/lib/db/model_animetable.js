var mongoose = require('mongoose')
  ;

var schemaTableAnime = mongoose.Schema({
	num_entries: Number,
	num_anime: Number,
	num_tv: Number,
	num_movie: Number,
	num_side: Number,
	num_spinoff: Number,
	num_ova: Number
}, { collection: 'table_anime' });

var ModelTableAnime = mongoose.model('ModelTableAnime', schemaTableAnime);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelTableAnime;
}