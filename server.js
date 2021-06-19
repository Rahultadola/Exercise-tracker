const express = require('express')
const app = express()
const cors = require('cors')
const bdParser = require('body-parser')
var mongoose = require('mongoose');
const {Schema} = mongoose;

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bdParser.urlencoded({extended: false}))

secDataBaseKey = process.env['DATABASE_URI']

mongoose.connect(secDataBaseKey, {useNewUrlParser: true,useUnifiedTopology: true });

const userSchema = new Schema({
  username: {type: String, required: true },
  exercise: [{description: {type: String, required: true}, duration: {type: Number, required: true}, date: {type: Date}}]
});

let Users = mongoose.model('Users', userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users').get((req, res, done) => {
  Users.find({}, '_id username', (err, usersData) => {
    if(err){
      handleError(err);
    }
    res.send(usersData);
    done(null, usersData)
  });
  
}).post((req, res) => {  
  const userObject =  Users({
    username: req.body.username
    });
  
  userObject.save((err) => {
    if(err){
      handleError(err);
    }    
  });  
  res.json({ username: userObject.username, _id: userObject._id});
});


app.post('/api/users/:_id/exercises', (req, res, done) => {
  const date = req.body.date ? new Date(req.body.date) : new Date(Date.now());
  const userId = req.params._id ? req.params._id : req.body['_id'];

  Users.findById(userId, (err, userData) => {    
    userData.exercise.push({
      description: req.body.description, duration: (req.body.duration), date: date}
    );
    userData.save((err, userData) => {     
      if(err) {handleError(err)}
      const resObject = {
        _id: userData._id, 
        username: userData.username, 
        date: date.toDateString(), 
        duration: parseInt(req.body.duration), 
        description: req.body.description
      }
      res.send(resObject);
      done(null, userData); 
    });    
  })
});

app.get('/api/users/:_id/logs', (req, res, done) => {
  const frommm = new Date(req.query.from);
  const toooo = new Date(req.query.to);
  const limitttt = parseInt(req.query.limit);
 
  console.log(frommm.getDate(), toooo.getDate(), limitttt)

  Users.findById({_id: req.params._id}, (err, data) => {
    var logsArr = [];
    if(!Number.isNaN(frommm.getDate()) && !Number.isNaN(frommm.getDate())){
      logsArr = data.exercise.filter((d, i) => d.date >= frommm && d.date <= toooo );
    } else {
      logsArr.push(...data.exercise)
    }  

    if(logsArr.length > limitttt){
      while(logsArr.length > limitttt){
        logsArr.pop()
      }
    }

    console.log('logsArr', logsArr);    
    res.send({log: [...logsArr], count: logsArr.length});

    if(err){
      handleError(err)
    }
    done(null, data)
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
