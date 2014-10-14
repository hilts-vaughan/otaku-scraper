var mongoose = require('mongoose')
  , schemaTranslation = require('./schema_translation')
  ;

var schemaAnime = mongoose.Schema({
	id: Number,
	titles: {},
	type: Number,
	episodes_released: Number,
	episodes_total: Number,
	status: Number,
	airing_start: Date,
	airing_end: Date,
	producers: [String],
	genres: [Number],
	episode_duration: Number,
	content_rating: Number,
	synopsis: String,
	adapted_type: Number,
	adapted_from: Number,
	anime_related: [Number],
	anime_sidestory: [Number],
	anime_spinoff: [Number],
	parent_type: Number,
	parent_id: Number
}, { collection: 'anime' });

var ModelAnime = mongoose.model('ModelAnime', schemaAnime);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelAnime;
}