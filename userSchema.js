const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/Cryptography')
  .then(() => console.log('Connect.......'))

const userSchmea = new mongoose.Schema({
    email: {type: String, required: true },
    dp: {type: String, required: true} 
})

const User = mongoose.model('user', userSchmea);
module.exports = {User}