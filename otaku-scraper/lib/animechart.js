var cheerio = require('cheerio')
  , request = require('request')
  ;

var AnimeChart = (function() {
  function AnimeChart() {}

  AnimeChart.fetch = function(callback) {

    var that = this;
    request({
          url: 'http://anichart.net/',
          headers: { 'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0' },
          timeout: 3000
        }, function(err, response, body) {
          if (err) {            
            return callback(err);
          }
          
          callback(null, that.tryParse(body));

          
        });

  };

    /*
      This method is really fragile; it's subject to page layout changes.
      We should do our best to keep up with breakages
    */
    AnimeChart.tryParse = function(html)
    {
        var $ = cheerio.load(html);
        var chart = {};

        // Extract the season from our DOM
        var season = $('title').first().contents().filter(function() {
          return this.type !== 'tag';
        }).text();

        var typeTitle = "TV -";
        chart.season = (season.indexOf("AniChart.net") == -1
            ? season.substring(0, season.indexof(" - "))
            : $(".type_title:contains('TV - ')").text().substring(typeTitle.length + 1)
            ).toLowerCase();

        var animeInfo = $(".anime_info").text();
        chart.info = animeInfo;

        return chart;
    };

  // export our class
  return AnimeChart;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimeChart;
}
