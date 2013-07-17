
var db = new gp.db('com.google.plus', 'todo');

// get a record from storage
db.get(1374012096471, function(record, error) {
	console.log(record);
});

// delete a record
db.del('115901314483429664348');

// enumerate all records
db.fetch(function(record, error) {
	console.log(record);
});
