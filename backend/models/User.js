const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['player', 'coach', 'turf', 'admin'], default: 'player' },
    status: { type: String, enum: ['active', 'pending'], default: 'active' },
    certificationPath: { type: String }, // For coaches
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
