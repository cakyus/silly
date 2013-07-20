
function _db(storage) {
	
	/**
	 * Connection handler
	 **/
	
	var connection = null;
	var database = location.host;
	var objectDatabase = this;
	
	/**
	 * Status
	 * 
	 * 0 - not connected
	 * 1 - connecting
	 * 2 - connected
	 **/
	
	var state = 0;
		
	this.get = function(key, callback) {
		
		if (state == 1){
			setTimeout(function() {
				objectDatabase.get(key, callback);
			}, 100);
			return this;
		} else if (state == 0){
			console.error('database is not connected');
			return this;
		}
		
		var transaction = connection.transaction([storage], 'readwrite');
		var objectStore = transaction.objectStore(storage);
		var request = objectStore.get(key);
		
		request.onsuccess = function(e) {
			callback(request.result, null);
		};
		
		request.onerror = function(e) {
			callback(null, e.value);
			console.error(e.value);
		};
	};
	
	
	this.fetch = function(callback) {
		
		if (state == 1){
			setTimeout(function() {
				objectDatabase.fetch(callback);
			}, 100);
			return this;
		} else if (state == 0){
			console.error('database is not connected');
			return this;
		}
		
		var transaction = connection.transaction([storage], 'readwrite');
		var objectStore = transaction.objectStore(storage);
		var keyRange = IDBKeyRange.lowerBound(0);
		var request = objectStore.openCursor(keyRange);
		
		request.onsuccess = function(e) {
				
			var result = e.target.result;
			
			if (!!result == false){
				return false;
			}
			
			if (callback != null){
				callback(result.value, null);
			}

			result.continue();
		};
		
		request.onerror = function(e) {
			callback(null, e.value);
			console.error(e.value);
		};
	};
	
	this.del = function(key, callback) {
		
		if (state == 1){
			setTimeout(function() {
				objectDatabase.del(key, callback);
			}, 100);
			return this;
		} else if (state == 0){
			console.error('database is not connected');
			return this;
		}
		
		var transaction = connection.transaction([storage], 'readwrite');
		var objectStore = transaction.objectStore(storage);
		var request = objectStore.delete(key);
		
		request.onsuccess = function(e) {
			if (callback != null){
				callback(null);
			}
		};
		
		request.onerror = function(e) {
			if (callback != null){
				callback(e.value);
			}
			console.error(e.value);
		};
	};
	
	this.put = function(object, key, callback) {
		
		if (state == 1){
			setTimeout(function() {
				objectDatabase.put(object, key, callback);
			}, 100);
			return this;
		} else if (state == 0){
			console.error('database is not connected');
			return this;
		}
				
		var transaction = connection.transaction([storage], 'readwrite');
		var objectStore = transaction.objectStore(storage);
		
		if (key == null){
			// get key from object
			if (object.id == null){
				// generate id, eg. 13741587372306480
				key = String((new Date()).getTime())
					+ String(Math.floor(Math.random() * 8999) + 1000)
					;
				key = parseInt(key);
			} else {
				key = object.id;
			}
		}
		
		var data = {};
		
		for (i in object){
			data[i] = object[i];
		}
		
		data[objectStore.keyPath] = key;
		
		try {		
			var request = objectStore.put(data);
		} catch(e) {
			console.log(data);
			console.error(e);
			return false;
		}
			
		request.onsuccess = function(e) {
			if (callback != null){
				callback(key, null);
			}
		};
		
		request.onerror = function(e) {
			if (callback != null){
				callback(null, e.value);
			}
			console.error(e.value);
		};
	};
	
	this.clear = function(callback) {
		
		if (state == 1){
			setTimeout(function() {
				objectDatabase.clear(callback);
			}, 100);
			return this;
		} else if (state == 0){
			console.error('database is not connected');
			return this;
		}
		
		var transaction = connection.transaction([storage], 'readwrite');
		var objectStore = transaction.objectStore(storage);
		var request = objectStore.clear();
		
		request.onsuccess = function(e) {
			if (callback != null){
				callback(null);
			}
		};
		
		request.onerror = function(e) {
			if (callback != null){
				callback(e.value);
			}
			console.error(e.value);
		};
	};
	
	var init = function(version) {
		
		// input validation
		if (storage == null){
			console.error('table must be specified');
			return false;
		}
		
		// opening database			
		state = 1;
		
		if (version == null){
			console.info('connecting to database ..');
			var request = indexedDB.open(database);
		} else {
			console.info('connecting to database version '+version);
			var request = indexedDB.open(database, version);
		}
		
		request.onsuccess = function(e) {
			connection = request.result;
			console.info(
				 'database version '+connection.version+' is opened'
				);
			
			if (connection.objectStoreNames.contains(storage) == false){
				var newVersion = connection.version + 1;
				connection.close();
				init(newVersion);
				return false;
			}
			
			state = 2; // connected
		};
		
		request.onerror = function(e) {
			state = 0; // failure
			console.error(e);
		};
		
		request.onupgradeneeded = function(e) {
			
			console.info('upgrading database "'+database+'"');
			
			var db = e.target.result;
			
			e.target.transaction.onerror = function(e) {
				console.error(e.value);
			};
			
			if (db.objectStoreNames.contains(storage) == false){
				db.createObjectStore(storage, {keyPath: 'id'});
			}
		};	
	};
	
	init();
	
	return this;
}

