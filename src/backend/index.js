const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const PORT = 3000;

// app.use(
//     cors({ origin: ['http://localhost:8080', 'http://127.0.0.1:8080'] })
// ); // for test

app.use(bodyParser.json());

async function getStaticFile(fileName) {
    try {
        const filePath = path.join(__dirname, '../../static', fileName);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Error reading or parsing the file: ' + error.message);
    }
}

app.get("/user-data", async (req, res) => {
    try {
        const data = await getStaticFile("user-data.json");
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not read the file.' });
    }
});

app.get("/form-data", async (req, res) => {
    try {
        const data = await getStaticFile("cis-form.json");
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not read the file.' });
    }
});

function generateRandomFileName() {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);

    return `WA_CIS_${timestamp}_${randomString}.pdf`;
}

app.get("/filling-form", async (req, res) => {
    try {
        const fillFormModule = require("./fill-form");
        const pdfBytes = await fillFormModule.fillForm();

        if (!pdfBytes) {
            return res.status(500).send('Error generating the PDF');
        }

        const pdfBuffer = Buffer.from(pdfBytes);
        const fileName = generateRandomFileName();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "application/pdf");

        res.send(pdfBuffer);
    } catch (err) {
        console.error('Error handling the request:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
