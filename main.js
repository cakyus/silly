
var db = new gp.db('com.google.plus', 'todo');

// get a record from storage
db.get(1374012096471, function(record, error) {
	console.log(record);
});

// enumerate all records
//db.fetch(function(record, error) {
	//console.log(record);
//});
