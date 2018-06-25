// db.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sandstormDB');

module.export = mongoose;