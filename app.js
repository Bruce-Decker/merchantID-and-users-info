var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TokenGenerator = require('uuid-token-generator');
var tokgen = new TokenGenerator(256, TokenGenerator.BASE62);


var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
var localStorage = require('localStorage')


var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI || "mongodb://localhost:27017/";
//It will be used for local storage 
mongoose.connect('mongodb://localhost/fastTrack');
//The line below will be used for Heroku deployment
//mongoose.connect(url);

var db = mongoose.connection;

var merchant_schema = mongoose.Schema({
	dataParams: {
		Name: String,
		DOB: String,
		Selfie: String
	},
	merchantID: String
});

var user_schema = mongoose.Schema({
	email: String,
	password: String,
	token: String
})


var curr_dir = process.cwd()
app.use(express.static("./"));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

var merchant_data = mongoose.model("merchantData", merchant_schema);

var user_data = mongoose.model("userData", user_schema);




app.get('/', function(req, res) {
	res.send("Please refer to readme in my github page for accessing endpoints. Postman will be use for POST request.");
	
})

app.get('/getAll', function(req, res){
	merchant_data.find({}, function(err, docs) {
        res.send(docs);
   });
});

app.get('/test', function(req, res) {
	res.sendFile(__dirname + '/test.html')
})


app.get('/getDataParametersForApproval/:merchantID', function(req, res){
	merchant_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
	  if (docs) {
		res.send(docs)
	  } else {
	  	res.send("Not available")
	  }
	})
});

app.get('/pollData/:merchantID', function(req, res){
		merchant_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
			if (docs) {
			res.send(docs)
		  } else {
		  	res.send("Not available")
		  }
		})
});



app.delete('/delete/:merchantID', function(req, res) {
	merchant_data.find({merchantID: req.params.merchantID}).remove().exec();
	merchant_data.find({}, function(err, docs) {
        res.send(docs);
   });
})


app.post('/shareData', function(req, res) {
	var Name = req.body.Name;
	var DOB = req.body.DOB;
	var Selfie = req.body.Selfie;
	var merchantID = req.body.merchantID;
	var dataParams = {Name: Name, DOB: DOB, Selfie: Selfie}
	var newData = {dataParams: dataParams, merchantID: merchantID}

	merchant_data.findOne({merchantID: merchantID}, function(err, docs) {
			if (docs) {
			 merchant_data.find({merchantID: merchantID}).remove().exec();
			 create_merchant();
		  } else {

		  	create_merchant();
		  }
		})

function create_merchant() {
	merchant_data.create(newData, function(err, newlyCreated){
		if (err) {
              console.log("Error Data");
              res.send("False");
        } else {
              res.send("True");
        }
	})
 }
})

/*
app.post('/createUser', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	//console.log("Email: " + email + " password " + password)
	var token = tokgen.generate();
	console.log(token)

	var userData = {email: email, password: password, token: token}
	user_data.create(userData, function(err, newlyCreated) {
		if (err) {
              console.log("Error Data");
              res.send("False");
        } else {
              res.send("True");
        }

	})
	
})
*/

app.get('/getAllUsers', function(req, res) {
	user_data.find({}, function(err, docs) {
		res.send(docs)
	})
})

app.delete('/deleteUser/:email', function(req, res) {
	 user_data.find({email: req.params.email}).remove().exec();
	 user_data.find({}, function(err, docs) {
	 	res.send(docs);
	 })
})

app.get('/verifyUser', function(req, res) {
	var token = req.headers['token']
	user_data.findOne({token: token}, function(err, docs) {
		if (docs) {
			res.send("True") 
		} else {
			res.send("False")
		}
       
	})
})



io.sockets.on('connect', function(socket) {
var token = socket.handshake.query.t;
localStorage.setItem('token', token)
console.log("io token " + token)
	app.post('/createUser', function(req, res) {
			var email = req.body.email;
			var password = req.body.password;
			token = localStorage.getItem('token')
			//console.log("Email: " + email + " password " + password)
			//var token = tokgen.generate();
			//console.log(token)
			//console.log("AAA " + socket.handshake.query.t)

			user_data.find({email: email}, function(err, docs) {
			if (docs) {
			  user_data.find({email: email}).remove().exec();
			  create_user();
		  } else {

		  	create_user();
		  }
		})
			console.log("1 token " + token)
			var userData = {email: email, password: password, token: token}

		function create_user() {
			user_data.create(userData, function(err, newlyCreated) {
				if (err) {
		              console.log("Error Data");
		              res.send("False");
		        } else {
		              res.send("True");
		        }

			})
		}
	
  })

app.get('/pollData2', function(req, res){
	var token = localStorage.getItem('token')
	console.log("A " + token)

		user_data.findOne({token: token}, function(err, docs) {
			if (docs) {
			res.send(docs)
		  } else {
		  	res.send("Not available")
		  }
		})
	});
   //connections.push(socket);
  // console.log(socket.id)
  // console.log("sdfsdf "  + socket.handshake.query.t)
   //console.log("address " + socket.handshake.address)
   console.log('Connected: %s sockets connected', connections.length);

   socket.on('disconnect', function(data){
   	 connections.splice(connections.indexOf(socket), 1);
     console.log('Disconnected: %s sockets connected', connections.length);
   });

   socket.on('send message', function(data) {
   	  console.log(data)
   	  io.sockets.emit('new message', {msg: data});
   })

   for (var i = 0; i < connections.length; i++) {
   	  //console.log(connections[i].handshake.query.t)
   	  if (connections[i].handshake.query.t == socket.handshake.query.t) {
   	  	  if (i > -1) {
   	  	  	  connections.splice(i ,1)

   	  	  }
   	  }
   }

   connections.push(socket)
   
   connections.forEach(function(element) {
   	  console.log("for each " + element.handshake.query.t)
   })
   
});


const PORT = process.env.PORT || 3000;
server.listen(PORT);
console.log("Running on port 3000.")



