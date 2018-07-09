var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TokenGenerator = require('uuid-token-generator');
var tokgen = new TokenGenerator(256, TokenGenerator.BASE62);
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport');
var fs = require('fs')


var curr_dir = process.cwd()

 var apn = require("apn");
 var path = require('path');

/*
const { APNS } = require('apns2')
 
let client = new APNS({
  team: `5P3B5P74MT`,
  keyId: `G25AXZBWJC`,
  signingKey: fs.readFileSync(curr_dir + '/AuthKey_G25AXZBWJC.p8'),
  defaultTopic: `com.IDXStudio.FastPassMerchant`
})
*/




//var curr_dir = process.cwd()


const User = require('./models/User');
require('./config/passport')(passport);


var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
var localStorage = require('localStorage')


const validateRegisterInput = require('./validation/register')
const validateLoginInput = require('./validation/login')
const keys = require('./config/keys')


var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI || "mongodb://localhost:27017/";
//It will be used for local storage 
//mongoose.connect('mongodb://localhost/fastTrack');
//The line below will be used for Heroku deployment
mongoose.connect(url);

var db = mongoose.connection;

var merchant_schema = mongoose.Schema({
	dataParams: {
		name: String,
		age: String,
		selfie: String
	},
	merchantID: String
});

var configuration_schema = mongoose.Schema({
	merchantID: String,
	selfie: String,
	indicator: Boolean
})

var history_schema = mongoose.Schema({
	location: String,
	date: String,
	name: String
})

/*
var user_schema = mongoose.Schema({
	email: String,
	password: String,
	
})
*/


//var curr_dir = process.cwd()
app.use(express.static("./"));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(bodyParser.json({limit: '50mb', extended: true}));




var merchant_data = mongoose.model("merchantData", merchant_schema);

var configuration_data = mongoose.model("configData", configuration_schema);

var history_data = mongoose.model("historyData", history_schema)

/*
var user_data = mongoose.model("userData", user_schema);
*/



app.get('/', function(req, res) {
	//res.send("Please refer to readme in my github page for accessing endpoints. Postman will be use for POST request.");
	res.sendFile(curr_dir + '/screenshot.html')
	
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

app.post('/getConfigurationbyMerchantID',  (req, res) => {

	var selfie = req.body.selfie;
	var merchantID = req.body.merchantID;
	var indicator = req.body.indicator;

	res.setTimeout(12000, function() {
		   try {
        var options = {
            cert: path.join(__dirname, 'push_dev.pem'),         // Certificate file path
            passphrase: '123456',                             // A passphrase for the Key file
            ca: path.join(__dirname, 'aps_development.cer'),// String or Buffer of CA data to use for the TLS connection
            production:false,
            gateway: 'gateway.sandbox.push.apple.com',      // gateway address
            port: 2195,                                     // gateway port
            enhanced: true                                  // enable enhanced format
        };
        var apnConnection = new apn.Connection(options);
        var myDevice = new apn.Device("3453d878599838d3483ba40334d221dc8c9d469a2ce51852f3f46fb094f6fe21");
        var note = new apn.Notification();
        //note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 3;
        note.sound = "ping.aiff";
        note.alert = "You have a new message";
        note.payload = {'msgFrom': 'Alex'};
        note.device = myDevice;
        apnConnection.pushNotification(note);
        console.log("sdfsdfsfd")



        process.stdout.write("******* EXECUTED WITHOUT ERRORS************ :");
        


    } catch (ex) {
        process.stdout.write("ERROR :"+ex);
    }


     res.send(selfie)
     next();
	})

	
 /*
	const { BasicNotification } = require('apns2')
	let bn = new BasicNotification("3453d878599838d3483ba40334d221dc8c9d469a2ce51852f3f46fb094f6fe21", merchantID)
 
	try {
	  await client.send(bn)
	  
	  console.log("test for push BasicNotification")
	} catch(err) {
	  console.error("API in getConfigurationbyMerchantID " + err.reason)
	  
	}
*/
	//console.log("selfie is " + selfie)
	
})

app.post('/pollData/:merchantID', function(req, res){
		merchant_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
			if (docs) {
			res.send(docs.dataParams)
		  } else {
		  	res.send("Not available")
		  }
		})
});


/*
app.delete('/delete/:merchantID', function(req, res) {
	merchant_data.find({merchantID: req.params.merchantID}).remove().exec();
	merchant_data.find({}, function(err, docs) {
        res.send(docs);
   });
})
*/


app.post('/shareData', function(req, res) {
	var name = req.body.name;
	var age = req.body.age;
	var selfie = req.body.selfie;
	var merchantID = req.body.merchantID;
	var dataParams = {name: name, age: age, selfie: selfie}
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
              res.send({msg: "False"});
        } else {
              res.send({msg: "True"});
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
	User.find({}, function(err, docs) {
		res.send(docs)
	})
})

/*

app.delete('/deleteUser/:email', function(req, res) {
	 user_data.find({email: req.params.email}).remove().exec();
	 user_data.find({}, function(err, docs) {
	 	res.send(docs);
	 })
})
*/

/*

app.get('/verifyUser', function(req, res) {
	var token = req.headers['token']
	user_data.findOne({token: token}, function(err, docs) {
		if (docs) {
			res.send({msg: "True"}) 
		} else {
			res.send({msg: "False"})
		}
       
	})
})
*/

app.post('/createUser', function(req, res) {
	const { errors, isValid } = validateRegisterInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	} 

	User.findOne({ email: req.body.email })
	    .then(user => {
	    	if(user) {
	    		errors.email = 'Email already exists'
	    		return res.status(400).json(errors)
	    	} else {
	    		var email = req.body.email;
			    var password = req.body.password;
			    var merchantID = req.body.merchantID;
			    var userData = new User({email: email, password: password, merchantID: merchantID})
			    bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(userData.password, salt, (err, hash) => {
                        if (err) throw err;
                            userData.password = hash;
                            userData
                                .save()
                                .then(user => res.json(user))
                                .catch(err => console.log(err))
                  })
               })

	    	}


	 })


	/*
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
		*/
	
})

app.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
       return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({email})
       .then(user => {
           if (!user) {
               errors.email = 'User not found';
               return res.status(404).json(errors)
           }

           // Check Password
           bcrypt.compare(password, user.password)
              .then(isMatch => {
                  if(isMatch) {
                      //res.json({msg: 'Sucess'})
                      //User matched
                      const payload = { id: user.id, name: user.name} //Create JWT payload
                      jwt.sign(
                          payload, 
                          keys.secretOrKey, 
                          { expiresIn: 3600 }, 
                          (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                      });
                  } else {
                      errors.password = 'Password incorrect'
                      return res.status(400).json(errors)
                  }
              })
       })
})

app.get('/pollData2', passport.authenticate('jwt', {session: false}), function(req, res) {

/*
     res.json({
     	 
     	 email: req.user.email,
     	 password: req.user.password
     })

     */
     console.log(req.user.merchantID)
    merchant_data.findOne({merchantID: req.user.merchantID}, function(err, docs) {
			if (docs) {
			res.send(docs.dataParams)
		  } else {
		  	
		  	res.send("Not available")
		  }
		})
})


/*
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
*/



app.post('/demoData', function(req, res){
          var name = req.body.name;
          var age = req.body.age;
          var merchantID = req.body.merchantID;
          var selfie = req.body.selfie;
          var dataParams = {name: name, age: age, selfie: selfie}
          var newData = {dataParams: dataParams, merchantID: merchantID};
          merchant_data.create(newData, function(err, newlyCreated){
             if (err) {
              console.log("Error");
             } else {
             
              setTimeout(function(){ res.redirect("/"); }, 4000);
             }
          });
});

/*
io.sockets.on('connect', function(socket) {
var token = socket.handshake.query.t;
localStorage.setItem('token', token)
console.log("io token " + token)
	


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
*/


const PORT = process.env.PORT || 3000;
server.listen(PORT);
console.log("Running on port 3000.")

function video() {

	
	var video = document.getElementById('video'),
	    canvas = document.getElementById('canvas'),
	   
	    context = canvas.getContext('2d'),
	    vendorUrl = window.URL || window.webkitURL;
	navigator.getMedia = navigator.getUserMedia ||
	                     navigator.webkitGetUserMedia ||
	                     navigator.mozGetUserMedia ||
	                     navigator.msGetUserMedia;

	navigator.getMedia ({
		video: true,
		audio: false
	}, function(stream) {
         video.src = vendorUrl.createObjectURL(stream);
         video.play();
	}, function(error) {

	});

	$('#form_button').on('click', function() { 

          context.drawImage(video, 0, 0, 400, 300);
            dataURL = canvas.toDataURL();
          
          var name = document.getElementById('name').value;
          var age = document.getElementById('age').value;
          var merchantID = document.getElementById('merchantID').value;
         
          var selfie = dataURL;
          var info = {name: name, age: age, selfie: selfie, merchantID: merchantID};
          $.ajax({
            type: 'POST',
            url: '/demoData',
            data: info
          });


          
});

}

