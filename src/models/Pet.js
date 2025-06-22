import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  species:    { type: String, required: true },   
  breed:      { type: String },
  age:        { type: Number, min: 0 },
  description:{ type: String },
  imageUrl:   { type: String },
  status:     { type: String,
                enum: ['available','adopted'],
                default: 'available' },
}, { timestamps: true });

export default mongoose.model('Pet', petSchema);
