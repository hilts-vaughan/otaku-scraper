var mongoose = require('mongoose')
  , schemaTranslationPair = require('schema_translationpair')
  ;

var schemaEpisode = mongoose.Schema({
	id: Number,
	anime_id: Number,
	episode_num: Number,
	titles: [schemaTranslationPair],
	air_date: Date,
	notes: String
}, { collection: 'episode' });

var ModelEpisode = mongoose.model('ModelEpisode', schemaTableAnime);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelEpisode;
}