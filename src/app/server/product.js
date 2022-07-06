const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  price: Number,
  stock: Number,
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }]
}, { versionKey: false });

module.exports = mongoose.model('Product', ProductSchema);
