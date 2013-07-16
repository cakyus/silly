
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
	 * Open database connection
	 **/
	
	this.open = function(database) {
		
		var request = indexedDB.open(
			  database
			, schema.version
			);
			
		request.onsuccess = function(e) {
			console.info('database "'+database+'" is opened');
			connection = request.result;
			success_trigger();
		};
		
		request.onerror = function(e) {
			console.error(e.value);
			fail_trigger();
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
	 * Database storage
	 **/
	
	this.storage = {
		
		table: null,
		
		open: function(table) {
			this.table = table;
			return this;
		},
		
		put: function(object, key) {
			
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
		
		get: function() {
			
			var table = this.table;
			var transaction = connection.transaction([table], 'readwrite');
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
};

