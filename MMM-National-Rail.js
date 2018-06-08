Module.register('MMM-National-Rail', {

    defaults: {
            token_value:	'6a35568a-8156-4119-95f1-1fc871eb4c55',
            num_rows:		10, // default value of 10
            interval:   	60000, // Every 1 min
        },


        start:  function() {
            Log.info('Starting module: ' + this.name);
    
            if (this.data.classes === 'MMM-National-Rail') {
                this.data.classes = 'bright medium';
                }
    
            // Set up the local values, here we construct the request url to use
            this.loaded = false;
            this.url = 'https://huxley.apphb.com/arrivals/pmr?accessToken=';
            this.location = 'PMR';
            this.result = null;
    
            // Trigger the first request
            this.getTrainArrivalData(this);
            },
    
    
        getStyles: function() {
            return ['national-rail.css', 'font-awesome.css'];
            },
    
        getTrainArrivalData: function(that) {
            // Make the initial request to the helper then set up the timer to perform the updates
            that.sendSocketNotification('GET-TRAIN-ARRIVAL', that.url + defaults.token_value);
            setTimeout(that.getTrainArrivalData, that.config.interval, that);
            },
    
        getDom: function() {
            // Set up the local wrapper
            var wrapper = document.createElement('div');
            var timeToArrive = 0;
    
            // If we have some data to display then build the results table        
            if (this.loaded) {
                if (this.result !== null) {
    
                    trainResults = document.createElement('table');
                    trainResults.className = 'tubeStatus bright';
    
                    for (var i=0; i < this.result.trainServies.length; i++) {
                        lineRow = document.createElement('tr');
    
                        lineName = document.createElement('td');
                        lineName.innerHTML = this.result[i].destination.locationName;
    
                        sta = document.createElement('td');
                        sta.innerHTML = this.result[i].sta;
    
                        eta = document.createElement('td');
                        eta.innerHTML = this.result[i].sta;;
    
                        lineRow.appendChild(lineName);
                        lineRow.appendChild(sta);
                        lineRow.appendChild(eta);
    
                        trainResults.appendChild(lineRow);
                       
                        }
                    wrapper.appendChild(trainResults);
                    
                } else {
                    // Otherwise lets just use a simple div
                    wrapper.innerHTML = 'Error getting train arrival times.';
                    }
            } else {
                // Otherwise lets just use a simple div
                wrapper.innerHTML = 'Loading train arrival times...';
                }
    
            return wrapper;
            },
    
    
        socketNotificationReceived: function(notification, payload) {
            // check to see if the response was for us and used the same url
            if (notification === 'GOT-TRAIN-ARRIVAL' && payload.url === this.url) {
                    // we got some data so set the flag, stash the data to display then request the dom update
                    this.loaded = true;
                    this.result = payload.result;
                    this.updateDom(1000);
                }
            }
        });
    
