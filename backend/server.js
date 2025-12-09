const express = require('express');
// require('dotenv').config(); // DISABLED
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

// Schema Imports
const UserSchema = require('./models/User').schema;
const TurfSchema = require('./models/Turf').schema;
const CertificateSchema = require('./models/Certificate');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- MONGODB CONNECTIONS ---
const MONGODB_URI = "mongodb+srv://kandasagar2006_db_user:v9o2Gad5rBOAn1NF@cluster0.cc5m27k.mongodb.net/";
const MONGODB_CERTIFICATES_URI = "mongodb+srv://kandasagar2006_db_user:ju4XHmHkeH14OuAN@cluster0.srq81dd.mongodb.net/";

// 1. Main DB
const mainDb = mongoose.createConnection(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mainDb.on('connected', () => console.log('✅ Connected to Main DB'));
mainDb.on('error', (err) => console.error('❌ Main DB Error:', err));

// 2. Cert DB
const certDb = mongoose.createConnection(MONGODB_CERTIFICATES_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
certDb.on('connected', () => console.log('✅ Connected to Cert DB'));
certDb.on('error', (err) => console.error('❌ Cert DB Error:', err));

// Models
const User = mainDb.model('User', UserSchema);
const Turf = mainDb.model('Turf', TurfSchema);
const Certificate = certDb.model('Certificate', CertificateSchema);


// Nodemailer Config
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "kandasagar2006@gmail.com",
        pass: "wtww bwka hopd yiyl"
    }
});

// --- API ROUTES ---

// 1. Send OTP
const otpStore = new Map();
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);

    try {
        await transporter.sendMail({
            from: "kandasagar2006@gmail.com",
            to: email,
            subject: 'SportsConnect OTP',
            text: `Your OTP is ${otp}`
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Email failed' });
    }
});

// 2. Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otpStore.get(email) === otp) {
        otpStore.delete(email);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

// 3. Register
app.post('/api/register', upload.single('certificate'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const certificatePath = req.file ? req.file.path : null;

        if (role === 'coach' && !certificatePath) {
            return res.status(400).json({ success: false, message: 'Certificate required for coaches' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
            status: role === 'coach' ? 'pending' : 'active'
        });
        const savedUser = await newUser.save();

        if (role === 'coach') {
            const newCert = new Certificate({
                userId: savedUser._id,
                email: savedUser.email,
                filePath: certificatePath,
                status: 'pending'
            });
            await newCert.save();
        }

        res.json({ success: true, message: 'Registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// 4. Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ success: false, message: 'Account pending approval' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'Account application was rejected.' });
        }

        res.json({ success: true, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login error' });
    }
});

// 5. Admin Pending
app.get('/api/admin/pending-coaches', async (req, res) => {
    try {
        const pendingCerts = await Certificate.find({ status: 'pending' });

        const coaches = await Promise.all(pendingCerts.map(async (cert) => {
            const user = await User.findById(cert.userId);
            return {
                _id: cert.userId,
                certId: cert._id,
                name: user ? user.name : 'Unknown',
                email: cert.email,
                certificationPath: cert.filePath
            };
        }));
        res.json({ success: true, coaches });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching coaches' });
    }
});

// 6. Admin Approve
app.post('/api/admin/approve-coach', async (req, res) => {
    try {
        const { coachId, action } = req.body;
        const cert = await Certificate.findOne({ userId: coachId });

        if (action === 'approve') {
            await User.findByIdAndUpdate(coachId, { status: 'active' });
            if (cert) {
                cert.status = 'approved';
                await cert.save();
            }
        } else {
            await User.findByIdAndUpdate(coachId, { status: 'rejected' });
            if (cert) {
                cert.status = 'rejected';
                await cert.save();
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Action failed' });
    }
});

// 7. Turf Create
app.post('/api/turf/create', async (req, res) => {
    try {
        const { ownerId, name, location, price, timings } = req.body;
        const newTurf = new Turf({ ownerId, name, location, price, timings });
        await newTurf.save();
        res.json({ success: true, message: 'Turf created' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating turf' });
    }
});

// 8. My Turfs
app.get('/api/turf/my-turfs', async (req, res) => {
    try {
        const { ownerId } = req.query;
        const turfs = await Turf.find({ ownerId });
        res.json({ success: true, turfs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching turfs' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
