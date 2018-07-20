### Heroku Link 

https://merchant-id-users.herokuapp.com


### API Endpoints 

Note: Some APIs were created due to requests from customers. Customers change requirements constantly. 
I preserved some APIs for documentation purpose. 

# New APIs (Updated on July 19th, 2018)

### /createClientUser (POST)
![alt text](Pictures/createClientUser.png "Description goes here")

### /loginClientUser (POST)
![alt text](Pictures/loginClientUser.png "Description goes here")

### /createHistory (POST)
![alt text](Pictures/createHistory.png "Description goes here")

### /scanHistory/:userID (GET)
![alt text](Pictures/scanHistory.png "Description goes here")

### /saveDeviceToken (POST)
![alt text](Pictures/saveDeviceToken.png "Description goes here")

### /updateDeviceToken (POST)
![alt text](Pictures/updateDeviceToken.png "Description goes here")

### /createTemporaryReulgarUser (POST)
![alt text](Pictures/createTemporaryRegularUser.png "Description goes here")

### /createTemporaryMerchantUser (POST)
![alt text](Pictures/createTemporaryMerchantUser.png "Description goes here")

### /saveDeviceToken (POST)
![alt text](Pictures/saveDeviceToken.png "Description goes here")

### /updateDeviceToken (POST)
![alt text](Pictures/updateDeviceToken.png "Description goes here")


POST request (/createTemporaryMerchantUser)
Body:
        100: Name,
        101: DOB,
        102: Age,
        103: Sex,
        104: Address,
        105: Phone,
        106: Email,
        107: Height,
        108: Weight,
        109: DL_Number,
        110: DL_Image,
        111: Selfie,
        113: Passport_Number,
        113: Passport_Image,
        114: SSN,
        115: Last4SSN,
        9999: merchantID
Response:
        {msg: “True”}
        Or {msg: “False”}
        
### /getMerchantConfig/:merchantID (POST)
![alt text](Pictures/getMerchantConfig.png "Description goes here")

### /fetchTempUser/:userID (POST)
![alt text](Pictures/fetchTempUser.png "Description goes here")

Response: 
[
    {
    "key": "100",
    "value": "Batman"
    },
    {
    "key": "101",
    "value": "1968"
    },
    {
    "key": "104",
    "value": "San Jose"
    }
]


# Old APIs (reference only)

| Verb  | Route  | Description  |
| ------------ | ------------ | ------------ |
| GET  | /getDataParametersForApproval/merchantID  |  get info for specfic user according to merchantID  |
| GET  | /pollData/merchantID  | get info for specfic user according to merchantID  |
| GET  | /pollData2 | Used Json Web Token (JWT) for validating with token (alternative option)  |
| POST | /shareData  | Post user data and store it in database like merchantID, selfie, DOB and name  |
| POST | /createUser  | Post user data and store it in database like email, password and session token  |
| DELETE  | /delete/merchantID  | delete a specfic user according to merchantID   |
| GET  | /getAll  | Display data from all users like merchantID, selfie, name |
| GET  | /getAllUsers  | Display all user info like email, password and session token |
| DELETE  | /deleteUser/email  | delete a specfic user info according to email  |
| GET  | /  | Intro page for Heroku  |


When performing POST request on /shareData and /createUser, if email or merchantID is identifcal to existing ones in the database, the information related to that email or merchantID will be updated. 


### /shareData (POST)
![alt text](Pictures/POST.png "Description goes here")

### /getDataParametersForApproval/merchantID (GET)
![alt text](Pictures/getDataParametersForApproval.png "Description goes here")

### /getAll (GET)
![alt text](Pictures/getAll.png "Description goes here")

### /delete/merchantID (DELETE)
![alt text](Pictures/delete.png "Description goes here")

### /pollData/merchantID (GET)
![alt text](Pictures/pollData.png "Description goes here")

### /getAllUsers  (GET)
![alt text](Pictures/getAllUsers.png "Description goes here")

### /deleteUser/email  (DELETE)
![alt text](Pictures/getAllUsers.png "Description goes here")



### /createUser (POST)
![alt text](Pictures/createUser.png "Description goes here")

### /login (POST)
![alt text](Pictures/login.png "Description goes here")

### /pollData2  (GET)

#### For /pollData2, use the token from login. Copy and paste into Authorization key field as shown in the picture.

![alt text](Pictures/pollData2.png "Description goes here")













