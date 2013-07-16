
// create database object
var db = new gp.db();

// open database
db.open('com.google.plus')
.success(function() {
	// open table
	var storage = db.storage.open('todo');
	// add new record
	var id = storage.put('Hello');
	// show a record
	storage.get(id);
	// delete record
	storage.del(id);
});

