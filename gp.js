
var gp = {};

gp.db = function() {
	
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
	var databaseInstance = this;
	
	/**
	 * Status
	 * 
	 * 0 - not connected
	 * 1 - connecting
	 * 2 - connected
	 * 3 - failure
	 **/
	
	var state = 0;
	
	/**
	 * Connect success handler
	 **/
	
	var success_callback = null;	
	var success_trigger = function() {
		if (success_callback != null){
			success_callback();
		}
	};
	this.success = function(callback) {
		success_callback = callback;
	};
	
	/**
	 * Connect fail handler
	 **/
	
	var fail_callback = null;
	var fail_trigger = function() {
		if (fail_callback != null){
			fail_callback();
		}
	};
	this.fail = function(callback) {
		fail_callback = callback;
	};
	
	/**
	 * Open database
	 **/
	
	this.open = function(database) {
		
		console.info('connecting to database "'+database+'"');
		
		var request = indexedDB.open(
			  database
			, schema.version
			);
			
		state = 1; // connecting
		
		request.onsuccess = function(e) {
			connection = request.result;
			state = 2; // connected
			console.info('database "'+database+'" is opened');
		};
		
		request.onerror = function(e) {
			state = 3; // failure
			console.error(e.value);
		};
		
		request.onupgradeneeded = function(e) {
			
			console.info('upgrading database "'+database+'"');
			
			var db = e.target.result;
			
			e.target.transaction.onerror = function(e) {
				console.error(e.value);
			};
			
			var tables = schema.tables;
			
			for (i = 0; i < tables.length; i++){
				
				var table = tables[i];
				
				if (db.objectStoreNames.contains(table.name)){
					db.deleteObjectStore(table.name);
				}
				
				var storage = db.createObjectStore(
					table.name,
					table.primaryKeys
				);
			}			
		};
		
		return this;
	};
	
	/**
	 * Database storage, emulate IDBObjectStore
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
	 **/
	 
	this.storage = {
		
		table: null,
		
		open: function(table) {
			
			this.table = table;
			
			if (state == 1){
				setTimeout(function() {
					databaseInstance.storage.open(table);
				}, 200);
				return this;
			}
			
			if (state != 2){
				console.error('database is not opened. state = '+state);
			}
			
			return this;
		},
		
		put: function(object, key) {
			
			if (state == 1){
				setTimeout(function() {
					databaseInstance.storage.put(object, key);
				}, 200);
				return this;
			}
			
			var table = this.table;
			var transaction = connection.transaction([table], 'readwrite');
			var storage = transaction.objectStore(table);
			
			if (key == null){
				// @todo key should be unique
				//		 time() is always unique in all cases
				key = (new Date()).getTime();
			}
			
			var request = storage.put({
				object: object,
				timestamp: key
			});
			
			request.onsuccess = function(e) {
				console.info('successfully save object in "'+table+'"');
			};
			
			request.onerror = function(e) {
				console.error(e.value);
			};
			
			return key;
		},
		
		get: function(key) {
			
			var table = this.table;
			var transaction = connection.transaction([table], 'readwrite');
			var storage = transaction.objectStore(table);
			var request = storage.get(key);
			
			request.onsuccess = function(e) {
				console.log(request.result);
			};
			
			request.onerror = function(e) {
				console.error(e.value);
			};
		},
		
		getAll: function() {
			
			var table = this.table;
			var transaction = connection.transaction([table], 'readonly');
			var storage = transaction.objectStore(table);
			
			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = storage.openCursor(keyRange);
			
			cursorRequest.onsuccess = function(e) {
				
				var result = e.target.result;
				
				if (!!result == false){
					return false;
				}
				
				console.log(result.value);;
				
				result.continue();
			};
			
			cursorRequest.onerror = function(e) {
				console.error(e.value);
			}
		},
		
		/**
		 * Delete a record in the table
		 **/
		
		del: function(key) {
			
			var table = this.table;
			var transaction = connection.transaction([table], 'readwrite');
			var storage = transaction.objectStore(table);
			var request = storage.delete(key);
			
			request.onsuccess = function(e) {
				console.info('successfully delete '+key+' from "'+table+'"');
				// @todo do something
			};
			
			request.onerror = function(e) {
				console.error(e.value);
			};
		},
		
		/**
		 * Delete all record from table
		 **/
		
		clear: function() {
			
		}
	};
	
	return this;
};

