var mongoose = require('mongoose')
  , schemaTranslationPair = require('schema_translationpair')
  ;

var schemaAnime = mongoose.Schema({
	id: Number,
	titles: [schemaTranslationPair],
	type: Number,
	episodes_released: Number,
	episodes_total: Number,
	status: Number,
	airing_start: Date,
	airing_end: Date,
	producers: [String],
	genres: [int],
	episode_duration: Number,
	content_rating: Number,
	synopsis: String,
	adapted_type: Number,
	adapted_from: Number,
	anime_related: [int],
	anime_sidestory: [int],
	anime_spinoff: [int],
	parent_type: Number,
	parent_id: Number
}, { collection: 'anime' });

var ModelAnime = mongoose.model('ModelAnime', schemaTableAnime);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelAnime;
}