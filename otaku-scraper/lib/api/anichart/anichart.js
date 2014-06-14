var api = global.api,
    cheerio = require('cheerio'),
    request = require('request'),
    Anime = require('../mal/anime.js'),
    ChartModel = require('../../db/chartmodel');

api.anichart = {
    current: function(req, res, next) {
        grabSeason(req, res, next);
    },
    spring: function(req, res, next) {
        grabSeason(req, res, next, 'spring');
    },
    summer: function(req, res, next) {
        grabSeason(req, res, next, 'summer');
    },
    fall: function(req, res, next) {
        grabSeason(req, res, next, 'fall');
    },
    winter: function(req, res, next) {
        grabSeason(req, res, next, 'winter');
    },
    tba: function(req, res, next) {
        grabSeason(req, res, next, 'tba');
    }
};

/**
 * Uses to delegate API calls and grab the correct season.
 * @param  {[Request]}   req - The request used to relay
 * @param  {[Resource]}   res - The resource we wish to consume
 * @param  {Function} next  - The next request
 * @param  {[String]}   season - The string season to use.
 */
function grabSeason(req, res, next, season) {
    if (season === undefined || season == null)
        season = '';

    res.type('application/json');

    var db = req.db;

    AniChart.fetch(season, function(err, chart) {
        res.send(chart);
    }, db);
}

var AniChart = (function() {
    function AniChart() {}

    /**
     * Downloads an entire season from the AniChart servers. This call is expensive as it will make a fetch to the MAL servers
     * to retrieve IDs for cross referencing as well. This call should only be made periodically and data should be fetched using
     * the 'fetch' function instead when possible.
     * @param  {[string]}   season - A string value for the current season. Valud values are 'winter, summer, spring, fall'. No value indiciates current.
     * @param  {Function} callback - The callback to be executed when
     * @return Nothing
     */
    AniChart.downloadSeason = function(season, callback) {
        // Downloads the given season
        var that = this;
        request({
            url: 'http://anichart.net/' + season,
            headers: {
                'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
            },
            timeout: 5000
        }, AniChart._getDownloadHandler(that, callback));
    };

    AniChart._getDownloadHandler = function(that, callback) {
        return function(err, response, body) {
            if (err) {
                return callback(err);
            }

            var chart = that.tryParse(body);
            var returns = 0;
            var callbacks = [];

            for (var i = 0; i < chart.info.length; i++) {
                callbacks[i] = (function(index) {
                    return function(err, mal_id) {
                        returns++;
                        chart.info[index].mal_id = err ? -3 : mal_id;
                        chart.info[index].lookuperr = err;

                        if (returns == chart.info.length) {
                            callback(chart);                            
                        }
                    };
                })(i);

                Anime.lookup(chart.info[i].title, callbacks[i]);
            }
        };
    };

    /**
     * Fetches the current season that is requested chart information. This is always
     * the current year that is being used.
     * @param  {[string]}   season - The season string
     * @param  {Function} callback - A simple callback to be executed
     * @return {[type]} Nothing
     */
    AniChart.fetch = function(season, callback) {
        var that = this;

        if (season == '' || season.toLowerCase() == "current") {
            request({
                url: 'http://anichart.net/' + season,
                   headers: {
                       'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
                   },
                   timeout: 5000
            }, function(err, response, body) {
                season = response['request']['uri']['path'].replace(/\//gm, '');

                ChartModel.findOne({
                    "season": season
                }, function(err, chart) {
                    if(chart == null) {
                        AniChart._getDownloadHandler(that, function(newChart){
                            var chartModelData = new ChartModel(newChart);
                            console.log('new chart');
                            chartModelData.save();
                            callback(null, newChart);
                        })(err, response, body);
                    }
                    else {
                        // otherwise, send the chart directly
                        callback(null, chart);
                    }
                });
            });
        }
        else {
            ChartModel.findOne({
                "season": season
            }, function(err, chart) {
                if(chart == null) {
                    AniChart.downloadSeason(season, function(newChart){
                        var chartModelData = new ChartModel(newChart);
                        console.log('new chart');
                        chartModelData.save();
                        callback(null, newChart);
                    });
                }
                else {
                    // otherwise, send the chart directly
                    callback(null, chart);
                }
            });
        }
        
    };



    /**
     * Takes some HTML and trys to parse a valid anime chart object from it. This function is incredibly fragile
     * as it is subject to page layouts from the AniChart team. As such, treat this method with suspect.
     * @param  {[string]} html - The HTML to work with and parse
     * @return {[Object]} - An object containing information regarding the given HTMLs chart data
     */
    AniChart.tryParse = function(html) {
        var $ = cheerio.load(html);
        var chart = {};

        // Extract the season from our DOM
        var season = $('title').first().contents().filter(function() {
            return this.type !== 'tag';
        }).text();

        var typeTitle = "TV -";
        chart.season = (season.indexOf("AniChart.net") == -1 ? season.substring(0, season.indexof(" - ")) : $(".type_title:contains('TV - ')").text().substring(typeTitle.length + 1)).toLowerCase();

        chart.info = [];
        var itrInfo = $(".anime_info,.anime_info_sml");
        console.log("iterating");
        while (itrInfo.length > 0) {
            var contents = itrInfo.first().contents();
            var tabinfo = contents.filter(".tabs").contents().filter(".tab_info").contents();
            var info = {};

            info.title = contents.filter(".title").text();
            if (info.title.indexOf("Fuun") == 0) info.title = info.title.replace("Fuun", "Fuuun");

            var source = "Source";
            info.source = tabinfo.filter(".info_box:contains('" + source + "')").text().substring(source.length + 1).trim();

            var director = "Director";
            info.director = tabinfo.filter(".info_box:contains('" + director + "')").text().substring(director.length + 1).trim();

            var seriesComp = "Series Comp";
            info.seriesComp = tabinfo.filter(".info_box:contains('" + seriesComp + "')").text().substring(seriesComp.length + 1).trim();

            var charDesign = "Char Design";
            info.charDesign = tabinfo.filter(".info_box:contains('" + charDesign + "')").text().substring(charDesign.length + 1).trim();

            var music = "Music";
            info.music = tabinfo.filter(".info_box:contains('" + music + "')").text().substring(music.length + 1).trim();

            var episodes = "Episodes";
            var nEpisodes = new Number(tabinfo.filter(".info_box:contains('" + episodes + "')").text().substring(episodes.length + 1).trim());
            if (isNaN(nEpisodes))
                nEpisodes = -1;
            info.episodes = nEpisodes;

            info.poster = $(contents).find(".thumb").attr('data-original');

            var nobox = tabinfo.filter(".info_nobox:contains('" + twitter + "')").text().trim();
            var twitter = "Twitter:";
            var premiere = "Premiere Date:";

            info.twitter = nobox.substring(nobox.indexOf(twitter) + twitter.length, nobox.indexOf(premiere)).trim();
            info.premiere = nobox.substring(nobox.indexOf(premiere) + premiere.length).trim();

            chart.info.push(info);

            itrInfo = itrInfo.next();
        }

        return chart;
    };

    // export our class
    return AniChart;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AniChart;
}