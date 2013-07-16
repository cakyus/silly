
var db = new gp.db();

db.open('com.google.plus')
	.storage.open('todo')
	.put('Hello World')
	;
