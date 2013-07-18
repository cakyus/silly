
var db = new _db('com.google.plus', 'notes');

var id = (new Date()).getTime();

// delete all records
db.clear();

// add data into storage
db.put({
	name: 'John Smith',
	message: 'Hello World !'
}, id);


// get a record from storage
db.get(id, function(record, error) {
	console.log(record);
});

// delete a record
db.del(id);

// enumerate all records
db.fetch(function(record, error) {
	console.log(record);
});

