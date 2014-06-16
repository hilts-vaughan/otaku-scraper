var CronTasks = (function() {

	function CronTasks() {}


	/**
	 * Setups cron tasks using the cron module to periodically perform tasks.
	 * Typically, this is used to bust caches on the server-side where needed.
	 */
	CronTasks.setupTasks = function() {

		// Setup our cache busting tasks where needed
		
		// 


	},


	/**
	 * This is a task that runs periodically that will reset and reobtain various season data
	 * from AniChart. This prevents data from going stale.
	 */
	CronTasks._resetAnichart = function() {

	}.


	/**
	 * This is a task that when run will scan all anime entries in the cached database and ensure
	 * no entries are stale. All entries that are deemed to be stale will be evicted and freshly populated.
	 * This prevents stale data from being served up too often. 
	 */
	CronTasks._scanAnime = function() {

	},


	/**
	 * This is a task that when run, will scan all managa in the cached database and ensure
	 * no entries are stale. Manga that is found to be stale will be evicted over time.
	 * @return {[type]} [description]
	 */
	CronTasks._scanManga = function() {

	}


	return CronTasks;
})();