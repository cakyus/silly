
var gp = {};

gp.db = function(database, storage) {
	
	/**
	 * Database schema
	 **/
	 
	var schema = {
		version: 10,
		tables: {
			 name: 'todo'
			,primaryKeys: {
				keyPath: 'timestamp'
			}
		}
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
		
		var __FUNCTION__ = this;
		
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
	
	return this;
};

