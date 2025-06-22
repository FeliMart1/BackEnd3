import mongoose from 'mongoose';

const adoptionRequestSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId,
            ref: 'User', required: true },
  pet:    { type: mongoose.Schema.Types.ObjectId,
            ref: 'Pet', required: true },
  date:   { type: Date, default: Date.now },
  status: { type: String,
            enum: ['pending','approved','rejected'],
            default: 'pending' },
}, { timestamps: true });

export default mongoose.model('AdoptionRequest', adoptionRequestSchema);
