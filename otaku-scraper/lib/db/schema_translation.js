var mongoose = require('mongoose')
  ;

var schemaTranslation = mongoose.Schema({
	language: String,
	translations: [String]
});

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = schemaTranslation;
}