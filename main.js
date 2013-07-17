
var db = new gp.db('com.google.plus', 'todo');

db.clear();

// add data into storage
db.put('Hello World !',1374012096471);

// get a record from storage
db.get(1374012096471, function(record, error) {
	console.log(record);
});

// delete a record
db.del(1374012096471);

// enumerate all records
db.fetch(function(record, error) {
	console.log(record);
});
