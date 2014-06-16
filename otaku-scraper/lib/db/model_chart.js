/*
	Defines our schema and interactive model for chart data.
	This is a mongoose defined model.
*/
mongoose = require('mongoose');

var chartSchema = mongoose.Schema({
	season: String,
	info: []
});

var ChartModel = mongoose.model('airingcharts', chartSchema);

module.exports = ChartModel;