Module.register('MMM-National-Rail', {

    defaults: {
            token_value:	'6a35568a-8156-4119-95f1-1fc871eb4c55',
            crs:			'PMR', // The CRS code for the station departure board that is required
            num_rows:		10 // default value of 10
            interval:   	60000 // Every 1 min
        },


    start:  function() {
        Log.info('Starting module: ' + this.name);

        if (this.data.classes === 'MMM-National-Rail') {
            this.data.classes = 'bright medium';
            }

        // Set up the local values, here we construct the request url to use
        this.loaded = false;
        this.envelope =
        '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
    		<Header>
    	    	<AccessToken xmlns="http://thalesgroup.com/RTTI/2013-11-28/Token/types">
            		<TokenValue>6a35568a-8156-4119-95f1-1fc871eb4c55</TokenValue>
        		</AccessToken>
    		</Header>
    		<Body>
        		<GetArrBoardWithDetailsRequest xmlns="http://thalesgroup.com/RTTI/2016-02-16/ldb/">
            		<numRows>10</numRows>
            		<crs>PMR</crs>
        		</GetArrBoardWithDetailsRequest>
    		</Body>
		</Envelope>';
		this.result = null;

        // Trigger the first request
        this.getNationalRailData(this);
        },


    getStyles: function() {
        return ['font-awesome.css'];
        },

    getNationalRailData: function(that) {
        // Make the initial request to the helper then set up the timer to perform the updates
        that.sendSocketNotification('GET-NATIONAL-RAIL', that.url);
        setTimeout(that.getNationalRailData, that.config.interval, that);
        },

    getDom: function() {
        // Set up the local wrapper
        var wrapper = document.createElement('div');
        var timeToArrive = 0;

        // If we have some data to display then build the results table
        if (this.loaded) {
            if (this.result !== null) {

		this.result.sort(function(a,b) {return (a.timeToStation > b.timeToStation) ? 1 : ((b.timeToStation > a.timeToStation) ? -1 : 0);} );

                tubeResults = document.createElement('table');
                tubeResults.className = 'tubeStatus bright';

                for (var i=0; i < this.result.length; i++) {
                    lineRow = document.createElement('tr');

                    lineName = document.createElement('td');
                    lineName.innerHTML = this.result[i].lineName;

                    lineDestination = document.createElement('td');
                    lineDestination.innerHTML = this.result[i].destinationName;

                    lineArrival = document.createElement('td');

		    timeToArrive = parseInt(this.result[i].timeToStation / 60) + ' minutes';
		    if (timeToArrive < 1) {
			timeToArrive = 'Due';
		    }
                    lineArrival.innerHTML = timeToArrive;

                    lineRow.appendChild(lineName);
                    lineRow.appendChild(lineDestination);
                    lineRow.appendChild(lineArrival);

                    tubeResults.appendChild(lineRow);

                    }
                wrapper.appendChild(tubeResults);

            } else {
                // Otherwise lets just use a simple div
                wrapper.innerHTML = 'Error getting National Rail data.';
                }
        } else {
            // Otherwise lets just use a simple div
            wrapper.innerHTML = 'Loading National Rail data...';
            }

        return wrapper;
        },


    socketNotificationReceived: function(notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-NATIONAL-RAIL' && payload.url === this.url) {
                // we got some data so set the flag, stash the data to display then request the dom update
                this.loaded = true;
                this.result = payload.result;
                this.updateDom(1000);
            }
        }
    });
