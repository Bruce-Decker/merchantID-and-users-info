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


const { APNS } = require('apns2')
 
let client = new APNS({
  team: `5P3B5P74MT`,
  keyId: `58GPG57T2C`,
  signingKey: fs.readFileSync(curr_dir + '/AuthKey_58GPG57T2C.p8'),
  defaultTopic: `com.IDXStudio.FastPassMerchant`,
  host: 'https://api.development.push.apple.com'
})

var options = {
  token: {
    key: curr_dir + '/AuthKey_58GPG57T2C.p8',
    keyId: "58GPG57T2C",
    teamId: "5P3B5P74MT"
  },
  production: false
};

var apnProvider = new apn.Provider(options);
//var deviceToken = "3453d878599838d3483ba40334d221dc8c9d469a2ce51852f3f46fb094f6fe21"
var deviceToken = "656551f8a09c6c969e13e0550069ae556cd7a66a4f4aa571a24b3886e5246b55"



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
	ageFlag: Boolean
})

var history_schema = mongoose.Schema({
	location: String,
	date: String,
	name: String
})

var property_index = {Name: 100, 
	                  DOB: 101, 
	                  Age: 102, 
	                  Sex: 103, 
	                  Address: 104, 
	                  Phone: 105, 
	                  Email: 106,
	                  Height: 107,
	                  Weight: 108,
	                  DL_Number: 109,
	                  DL_Image: 110,
	                  Selfie: 111,
	                  Passport_Number: 112,
	                  Passport_Image: 113,
	                  SSN: 114,
	                  Last4SSN: 115}

var property_schema = mongoose.Schema({
	100: Boolean,
	101: Boolean,
	102: Boolean,
	103: Boolean,
    104: Boolean,
    105: Boolean,
    106: Boolean,
    107: Boolean,
    108: Boolean,
    109: Boolean,
    110: Boolean,
    111: Boolean,
    112: Boolean,
    113: Boolean,
    114: Boolean,
    115: Boolean
})

var temporary_schema = mongoose.Schema({
	     Name: String, 
	     DOB: String, 
	     Age: String, 
	     Sex: String, 
	     Address: String, 
	     Phone: String, 
	     Email: String,
	     Height: String,
	     Weight: String,
	     DL_Number: String,
	     DL_Image: String,
	     Selfie: String,
	     Passport_Number: String,
	     Passport_Image: String,
	     SSN: String,
	     Last4SSN: String,
	     merchantID: String
})

var bar_schema = mongoose.Schema({
	merchantID: String,
	selfie: String,
	DOB: String
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

var property_data = mongoose.model("propertyData", property_schema)

var temporary_data = mongoose.model("temporaryData", temporary_schema)

var bar_data = mongoose.model("barData", bar_schema)

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

/*
app.get('/getRequiredUserInfo/:merchantID', function(req, res) {

    var result
	temporary_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
	  if (docs) {
		//res.send(docs)
		result = docs
		console.log(result.merchantID)
		console.log(result.Selfie)
   
		res.send(docs)
	  } else {
	  	res.send("Not available")
	  }
	})
    
})
*/


app.post('/createTemporaryMerchantUser', function(req, res) {
	var Name = req.body.Name;
	var DOB = req.body.DOB;
	var Age = req.body.Age;
	var Sex = req.body.Sex;
	var Address = req.body.Address;
	var Phone = req.body.Phone;
	var Email = req.body.Email;
	var Height = req.body.Height;
	var Weight = req.body.Weight;
	var DL_Number = req.body.DL_Number;
	var DL_Image = req.body.DL_Image;
	var Selfie = req.body.Selfie;
	var Passport_Number = req.body.Passport_Number;
	var Passport_Image = req.body.Passport_Image;
	var SSN = req.body.SSN;
	var Last4SSN = req.body.Last4SSN;
	var merchantID = req.body.merchantID
	var temp_user_data = {
		Name: Name,
		DOB: DOB,
		Age: Age,
		Sex: Sex,
		Address: Address,
		Phone: Phone,
		Email: Email,
		Height: Height,
		Weight: Weight,
		DL_Number: DL_Number,
		DL_Image: DL_Image,
		Selfie: Selfie,
		Passport_Number: Passport_Number,
		Passport_Image: Passport_Image,
		SSN: SSN,
		Last4SSN: Last4SSN,
		merchantID: merchantID
	}
	temporary_data.create(temp_user_data, function(err, newlyCreated) {
		if (err) {
			console.log("Error Data");
			 res.send({msg: "False"});
		} else {
			 res.send({msg: "True"});
		}
	})

})

app.get('/getMerchantConfig/:merchantID', function(req, res) {
	var array = []
	var json_Object
	temporary_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
		 if (docs) {
		 	if (docs.Name) {
		 		array.push("100")
		 	}
		 	if (docs.DOB) {
		 		array.push("101")
		 	}
		 	if (docs.Age) {
		 		array.push("102")
		 	}
		 	if (docs.Address) {
		 		array.push("103")
		 	}
		 	if (docs.Phone) {
		 		array.push("104")
		 	}
		 	if (docs.Email) {
		 		array.push("105")
		 	}
		 	if (docs.Height) {
		 		array.push("106")
		 	}
		 	if (docs.Weight) {
		 		array.push("107")
		 	}
		 	if (docs.DL_Number) {
		 		array.push("108")
		 	}
		 	if (docs.DL_Image) {
		 		array.push("109")
		 	}
		 	if (docs.Selfie) {
                array.push("110")
		 	}
		 	if (docs.Passport_Number) {
		 		array.push("111")
		 	}
		 	if (docs.Passport_Image) {
		 		array.push("113")
		 	}
		 	if (docs.SSN) {
		 		array.push("114")
		 	}
		 	if (docs.Last4SSN) {
		 		array.push("115")
		 	}
		 	json_Object = JSON.stringify(array)

		 	res.send({json_Object, Name: docs.Name, Address: docs.Address})
		 } else {
		 	res.send("Not available")
		 }
	})

})

app.post('/createBarData', function(req, res) {
	 var merchantID = req.body.merchantID;
	 var selfie = req.body.selfie;
	 var DOB = req.body.DOB;
	 var barData = {merchantID: merchantID, selfie: selfie, DOB: DOB}
	 bar_data.create(barData, function(err, newlyCreated) {
	 	if (err) {
	 		res.send({msg: "Fail"})
	 	} else {
	 		res.send({msg: "Sucess"})
	 	}
	 })

})

app.get('/getBarData/:merchantID', function(req, res) {
	bar_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
		if (docs) {
			res.send(docs)
		} else {
			res.send("Not available")
		}
	})
})

app.post('/push', async (req, res) => {

/*
	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 3;
	//note.sound = "ping.aiff";
	note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
	note.payload = {'messageFrom': 'John Appleseed'};
	note.topic = "com.IDXStudio.FastPassMerchant";
	apnProvider.send(note, deviceToken).then( (result) => {
  // see documentation for an explanation of result
       console.log(result)
    });
    res.send("Message sent")

*/

	
	
	  const { BasicNotification } = require('apns2')
 
	let bn = new BasicNotification(deviceToken, 'Hello, World')
	 
	try {
	  await client.send(bn)
	} catch(err) {
	  console.error(err.reason)
	}

	
})

app.post('/getDeviceToken', function(req, res) {
	 var deviceToken = req.body.deviceToken;
	 res.send({"msg": "Got device token"})
})


/*
app.post('/getConfigurationbyMerchantID',  (req, res) => {

	var selfie = req.body.selfie;
	var merchantID = req.body.merchantID;
	var ageFlag = req.body.ageFlag;
    var config = {merchantID: merchantID, selfie: selfie, ageFlag: ageFlag}
    configuration_data.create(config, function(err, newlyCreated) {
    	if (err) {
              console.log("Error Data");
              res.send({msg: "Fale"});
        } else {
              res.send({msg: "Sucess"});
        }

    })
})
*/



app.get('/getRegularUser/:merchantID', function(req, res) {
	configuration_data.findOne({merchantID: req.params.merchantID}, function(err, docs) {
		 if (docs) {
		 	res.send(docs)
		 } else {
		 	res.send("Not available")
		 }
	})
	setTimeout(function() {
		 configuration_data.findOne({merchantID: req.params.merchantID}).remove().exec();
	}, 1000)
	 

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

app.get('/getAllMerchantUsers', function(req, res) {
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


app.post('/createMerchantUser', function(req, res) {
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
			    var address = req.body.address;
			    var username = req.body.username;
			    var userData = new User({email: email, username: username, password: password, merchantID: merchantID, address: address})
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

