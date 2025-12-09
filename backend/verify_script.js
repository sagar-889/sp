const fs = require('fs');
const http = require('http');
const path = require('path');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const fileContent = fs.readFileSync('verification_cert.txt');
const filename = 'verification_cert.txt';

let body = '';
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="name"\r\n\r\nNode Coach\r\n`;

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="email"\r\n\r\nnode_coach_${Date.now()}@test.com\r\n`;

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="password"\r\n\r\npassword\r\n`;

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="role"\r\n\r\ncoach\r\n`;

body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="certificate"; filename="${filename}"\r\n`;
body += `Content-Type: text/plain\r\n\r\n`;
body += fileContent;
body += `\r\n--${boundary}--\r\n`;

const postData = Buffer.from(body);

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
        // Check Admin
        checkAdmin();
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();

function checkAdmin() {
    console.log('--- Checking Admin Pending List ---');
    http.get('http://localhost:8080/api/admin/pending-coaches', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Admin List:', data);
        });
    });
}
