var cheerio = require('cheerio'),
    request = require('request'),
    MAL = require("./mal.js"),
    AnimeChartRankedModel = require('../../db/model_anime_chart_ranked'),
    ExpiryHelper = require('../../expiryhelper');

var api = global.api;

api.mal.chart = {
    
    anime: function(req, res, next) {
        res.type('application/json');

        var start = req.params.start;

        MALChart.getChartAnime(start, '', function(data) {
            res.send(data);
        });
    },


    manga: function(req, res, next) {
        res.type('application/json');

        var start = req.params.start;

        MALChart.getChartManga(start, '', function(data) {
            res.send(data);
        });
    }    




};

var MALChart = (function() {
    function MALChart() {}

    MALChart.getChartAnime = function(start, type, callback) {

        request({
            url: 'http://myanimelist.net/topanime.php?type=' + type + '&limit=' + start,
            headers: {
                'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
            },
            timeout: 3000
        }, function(error, response, body) {
            if (error) {
                return callback(error);
            }

            var object = MALChart.parseChart(body);

            callback(object);
        });

    }


    MALChart.getChartManga = function(start, type, callback) {

        request({
            url: 'http://myanimelist.net/topmanga.php?type=' + type +  '&limit=' + start,
            headers: {
                'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
            },
            timeout: 3000
        }, function(error, response, body) {
            if (error) {
                return callback(error);
            }

            var object = MALChart.parseChart(body);

            callback(object);
        });

    }




    MALChart.parseChart = function(body) {
        var $ = cheerio.load(body);
        var chart = [];

        $('tr').each(function(i, elem) {
            chartItem = {};
            chartItem.rank = parseInt($(this).find("span").first().text());
            chartItem.url = parseInt($(this).find("a").first().attr('href').split("/")[2]);

            chart.push(chartItem);
        });

        return chart;
    }



    // export our class
    return MALChart;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MALChart;
}