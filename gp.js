
var gp = {};

gp.db = function(database, storage) {
	
	/**
	 * Database schema
	 **/
	 
	var schema = {
		version: 21,
		tables: [{
			 name: 'notes'
			,primaryKeys: {
				keyPath: 'id'
			}
		}]
	};
	
	/**
	 * Connection handler
	 **/
	
	var connection = null;
	var objectDatabase = this;
	
	/**
	 * Status
	 * 
	 * 0 - not connected
	 * 1 - connecting
	 * 2 - connected
	 **/
	
	var state = 0;
	
	// input validation
	
	if (database == null){
		console.error('database must be specified');
		return this;
	} else if (storage == null){
		console.error('table must be specified');
		return this;
	}
	
	// opening database
	
	console.info('connecting to database "'+database+'"');
	
	state = 1;
	var request = indexedDB.open(
		  database
		, schema.version
		);
	
	request.onsuccess = function(e) {
		connection = request.result;
		state = 2; // connected
		console.info('database "'+database+'" is opened');
	};
	
	request.onerror = function(e) {
		state = 0; // failure
		console.error(e.value);
	};
	
	request.onupgradeneeded = function(e) {
		
		console.info('upgrading database "'+database+'"');
		
		var db = e.target.result;
		
		e.target.transaction.onerror = function(e) {
			console.error(e.value);
		};
		
				db.deleteObjectStore('todo');
		for (i = 0; i < schema.tables.length; i++){
			
			var schemaTable = schema.tables[i];
			
			if (db.objectStoreNames.contains(schemaTable.name)){
				db.deleteObjectStore(schemaTable.name);
			}
			
			var storage = db.createObjectStore(
				schemaTable.name,
				schemaTable.primaryKeys
			);
		}
	};
	
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
			// generate unique id
			// eg. 13741587372306480
			key = String((new Date()).getTime())
				+ String(Math.floor(Math.random() * 8999) + 1000)
				;
			key = parseInt(key);
		}
		
		var data = {};
		
		for (i in object){
			data[i] = object[i];
		}
		
		data[objectStore.keyPath] = key;
		
		var request = objectStore.put(data);
			
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
	
	return this;
};

