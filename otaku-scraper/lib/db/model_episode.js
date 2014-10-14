var mongoose = require('mongoose')
  , schemaTranslation = require('schema_translation')
  ;

var schemaEpisode = mongoose.Schema({
	id: Number,
	anime_id: Number,
	episode_num: Number,
	titles: {},
	air_date: Date,
	notes: String
}, { collection: 'episode' });

var ModelEpisode = mongoose.model('ModelEpisode', schemaEpisode);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelEpisode;
}