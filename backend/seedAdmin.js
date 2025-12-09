const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to DB');

        const existingAdmin = await User.findOne({ email: 'admin@sportsconnect.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const admin = new User({
                name: 'Super Admin',
                email: 'admin@sportsconnect.com',
                password: 'adminpassword', // In cleartext for demo
                role: 'admin',
                status: 'active'
            });
            await admin.save();
            console.log('Admin created: admin@sportsconnect.com / adminpassword');
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
