
var db = new gp.db();

db.open('com.google.plus')
.success(function() {
	console.log('0k');
	var cursor = db.cursor.open('todo');
	cursor.put('Hello');
});

