const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/Cryptography')
  .then(() => console.log('Connect.......'))

const inboxSchmea = new mongoose.Schema({
    primary: { type: String, required: true},
    secondary: { type: String, required: true },
    msgs: [
        {
            text: {type:String, required: true},
            send: {type: Boolean, default: false},
            recieved: {type: Boolean, default: false},
            keyType: {type: String}
        }
    ]  
})

const Inbox = mongoose.model('inbox', inboxSchmea);
module.exports = {Inbox}