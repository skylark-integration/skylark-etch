define([
	"skylark-langx/skylark",
	"skylark-langx/langx"
],function(skylark,langx) {
	'use strict';

	var models = {},
		views = {},
		collections = {},
		etch = {};

	// versioning as per semver.org
	etch.VERSION = '0.6.3';


	// tack on models, views, etc... as well as init function
	langx.extend(etch, {
		models: models,
		views: views,
		collections: collections,
	});


	return langx.attach(skylark,"itg.etch",etch);
});
