const mongoose = require('mongoose');
// require('dotenv').config();

const MONGODB_URI = "mongodb+srv://kandasagar2006_db_user:v9o2Gad5rBOAn1NF@cluster0.cc5m27k.mongodb.net/";
const MONGODB_CERTIFICATES_URI = "mongodb+srv://kandasagar2006_db_user:ju4XHmHkeH14OuAN@cluster0.srq81dd.mongodb.net/";

// Schemas (Minimal for deletion)
const UserSchema = new mongoose.Schema({}, { strict: false });
const TurfSchema = new mongoose.Schema({}, { strict: false });
const CertificateSchema = new mongoose.Schema({}, { strict: false });

async function reset() {
    try {
        // 1. Connect Main DB
        const mainDb = mongoose.createConnection(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const User = mainDb.model('User', UserSchema);
        const Turf = mainDb.model('Turf', TurfSchema);

        // 2. Connect Cert DB
        const certDb = mongoose.createConnection(MONGODB_CERTIFICATES_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const Certificate = certDb.model('Certificate', CertificateSchema);

        await new Promise(r => setTimeout(r, 2000)); // Wait for connection

        console.log('Deleting Users...');
        await User.deleteMany({});

        console.log('Deleting Turfs...');
        await Turf.deleteMany({});

        console.log('Deleting Certificates...');
        await Certificate.deleteMany({});

        console.log('✅ All data cleared.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing DB:', err);
        process.exit(1);
    }
}

reset();
