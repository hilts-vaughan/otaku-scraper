var mongoose = require('mongoose')
  ;

var schemaTranslation = mongoose.schema({
	language: String,
	translations: [String]
});

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = schemaTranslation;
}