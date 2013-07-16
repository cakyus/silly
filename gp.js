
var gp = {};

//gp.db = {
	
	//connection: null,
	
	//success: function() {
		
	//},

	//open: function(database, table, callback) {
		
		//var version = 2;
		//var request = indexedDB.open(database, version);
		
		//request.onsuccess = function(e) {
			//console.info('successfully open database "'+database+'"');
			//gp.db.connection = request.result;
			//callback();
		//};
		
		//request.onerror = function(e) {
			//console.error(e.value);
		//};
		
		//request.onupgradeneeded = function(e) {
			
			//console.info('upgrading database "'+database+'"');
			
			//var db = e.target.result;
			
			//e.target.transaction.onerror = function(e) {
				//console.error(e.value);
			//};
			
			//if (db.objectStoreNames.contains(table)){
				//db.deleteObjectStore(table);
			//}
			
			//var storage = db.createObjectStore(table, {
				//keyPath: 'timestamp'
			//});
		//};
		
		//return this;
	//},
	
	//put: function(table, object, callback) {
		
		//var db = gp.db.connection;
		//var transaction = db.transaction([table], 'readwrite');
		//var storage = transaction.objectStore(table);
		//var request = storage.put({
			//object: object,
			//timestamp: (new Date()).getTime()
		//});
		
		//request.onsuccess = function(e) {
			//console.info('successfully save object in "'+table+'"');
			//callback();
		//};
		
		//request.onerror = function(e) {
			//console.error(e.value);
		//};
	//},
	
	//get: function(table) {
		
		//var db = gp.db.connection;
		//var transaction = db.transaction([table], 'readwrite');
		//var storage = transaction.objectStore(table);
		
		//var keyRange = IDBKeyRange.lowerBound(0);
		//var cursorRequest = storage.openCursor(keyRange);
		
		//cursorRequest.onsuccess = function(e) {
			
			//var result = e.target.result;
			
			//if (!!result == false){
				//return false;
			//}
			
			//console.log(result.value);;
			
			//result.continue();
		//};
		
		//cursorRequest.onerror = function(e) {
			//console.error(e.value);
		//}
		
	//},
	
	//del: function(table, id) {
		
		//var db = gp.db.connection;
		//var transaction = db.transaction([table], 'readwrite');
		//var storage = transaction.objectStore(table);
		//var request = storage.delete(id);
		
		//request.onsuccess = function(e) {
			//console.info('successfully delete '+id+' from "'+table+'"');
			
			//// @todo do somtehing
		//};
		
		//request.onerror = function(e) {
			//console.error(e.value);
		//};
	//}
	
//};

gp.db = function() {
	
	this.schema = {
		version: 6,
		tables: {
			 name: 'todo'
			,primaryKeys: {
				keyPath: 'timestamp'
			}
		}
	};
	
	this.connection = null;
	
	var success_callback = null;
	
	this.success = function(callback) {
		success_callback = callback;
	}
	
	this.success_trigger = function() {
		if (success_callback != null){
			success_callback();
		}
	};
	
	this.fail = function(callback) {
		if (arguments.length == 0){
			return false;
		}
		if (this.connection != null){
			return false;
		}
		callback();
		return this;
	};
	
	this.open = function(database) {
		
		var request = indexedDB.open(
			  database
			, (new gp.db).schema.version
			);
			
		connection = this.connection;
		success_trigger = this.success_trigger;
		
		request.onsuccess = function(e) {
			console.info('database "'+database+'" is opened');
			connection = request.result;
			success_trigger();
		};
		
		request.onerror = function(e) {
			console.error(e.value);
			this.fail;
		};
		
		request.onupgradeneeded = function(e) {
			
			console.info('upgrading database "'+database+'"');
			
			var db = e.target.result;
			
			e.target.transaction.onerror = function(e) {
				console.error(e.value);
			};
			
			var tables = (new gp.db).schema.tables;
			
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
	
	this.storage = function() {
		
		this.table = null;
		
		this.open = function(table) {
			this.table = table;
			return this;
		};
		
		this.put = function() {
			console.log(this.table);
		};
	};
};

