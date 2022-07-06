var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var departmentSchema = new Schema({
  name: String,
}, { versionKey: false });

module.exports = mongoose.model("Department", departmentSchema);
