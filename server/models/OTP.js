import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically expires and gets deleted after 5 minutes (300 seconds)
  }
});

const OTP = mongoose.model('OTP', OTPSchema);
export default OTP;
