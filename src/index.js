import React from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";


// global configuration
const DEBUG_PREFIX = "DEBUG";
const CACHE_SUFFIX = "_cache";
const CACHE_USABLE_TIME = 600; // API updated every 10 minutes
const SHOW_DEBUG_INFO = true;

var checkCache = function (url) {
	
	var cache_key = url + CACHE_SUFFIX;
	var json = null; 

	try {
		json = localStorage.getItem(cache_key);
	}
	catch(err) {
		console.log("Error: " + err);
	}

	return json;
}

var apiCallNeeded = function(cachedJsonString){

	if(cachedJsonString === null) {
		logDebugInfo("url not found in cache - API call needed");
		return true;
	}

	var json = JSON.parse(cachedJsonString);

	const cacheAge = Math.round(Date.now() / 1000) - json.lastUpdate;

	logDebugInfo("cache age: " + String(cacheAge) + " seconds : cache usable time: " + String(CACHE_USABLE_TIME) + " seconds");

	if(cacheAge <= CACHE_USABLE_TIME) {
		logDebugInfo("using cached response");
		return false;
	}

	logDebugInfo("cached json outdated - API call needed");

	return true;

}

var logDebugInfo = function(message){

	if(SHOW_DEBUG_INFO) console.log(DEBUG_PREFIX + ": " + message);

}

class App extends React.Component {
	componentDidMount(){
		$('button').click(function() {
			var url = "https://api.covid19api.com/country/south-africa/status/confirmed";
			var cachedJsonString = checkCache(url);

			

			if(apiCallNeeded(cachedJsonString)) {

				logDebugInfo("requesting update from " + url);
				
				document.getElementById('jsonResponseArea').innerHTML = '<p>Loading...</p>';

				$.ajax({
					url: url,
					type: 'GET',
					dataType: 'json', 
				})
				.done(function(response) {
					
					// add time of update
					const secondsSinceEpoch = Math.round(Date.now() / 1000);
					var json = {"lastUpdate": secondsSinceEpoch, "response": response};

					// display the data in a meaningful way
					document.getElementById('jsonResponseArea').innerHTML = '<p>' + JSON.stringify(json) + '</p>';
					
					// cache the response
					localStorage.setItem(url + CACHE_SUFFIX, JSON.stringify(json));
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.log("Error: " + errorThrown);
				});
			}
			else document.getElementById('jsonResponseArea').innerHTML = '<p>' + cachedJsonString + '</p>';
		});
	}
	
	render() {
		return(
			<div className="App">
				<h1>Request Json</h1>
				<button id="changeColorButton">Click Me</button>
				<p id="jsonResponseArea"></p>
			</div>
		);
	} 
}

ReactDOM.render(<App />, document.getElementById('root'));

