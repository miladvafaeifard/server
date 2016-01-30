var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

mongoose.connect('mongodb://localhost/todoSm');
var TodoSchema = new mongoose.Schema({
	id: Number,
	name: String,
	completed: Boolean,
	note: String,
	update_at: {
		type: Date, default: Date.now
	},
});

var Todo = mongoose.model('Todo', TodoSchema);

var whileList = ['http://localhost:9000', 'http://localhost:7880'];
var corOptions = {
	origin: function(origin, callback){
	    var originIsWhitelisted = whileList.indexOf(origin) !== -1;
	    callback(null, originIsWhitelisted);
  	}
};


app.all('/*', cors(corOptions), function(req, res, next){
  next();
});

app.use(function(req, res, next){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log('Client IP: ', ip);
	next();
});

app.use('/entries/:id', function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});

app.get('/entries', function (req, res, next) {
	todoMap = {};
  Todo.find({}, function(err, todos){
  	todos.forEach(function(todo){
  		todoMap[todo.id] = todo;
  	});
  	res.json(todoMap);
  });
    
});

app.get('/entries/:id', function (req, res, next) {
  Todo.findById(req.params.id, function(err, todo){
    if(err) res.send(err);
    res.json(todo);
  });
});

app.post('/entries/:id', function(req, res, next){
		console.log('body', req.body);
		Todo.create({
			id: req.body.id,
			name: req.body.name, 
			completed: req.body.completed, 
			note: req.body.note
		}, function(err, todo){
			if(err) {
				console.log(err)
			} else {
				console.log('--- created\n' + todo);
			}
		});
});

app.listen(8080, function(){
	console.log('mongodb app is listening on port 8080');
});
