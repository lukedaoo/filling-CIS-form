const fs = require('fs').promises;
const path = require('path');

const { PDFDocument } = require('pdf-lib');

const PDF_CONFIG = {
    fontSize: 18
}

function assert(condition, message) {
    if (condition) {
        throw new Error(message || "Assertion failed");
    }
}

async function getStaticFile(fileName) {
    try {
        const filePath = path.join(__dirname, '../../static', fileName);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Error reading or parsing the file: ' + error.message);
    }
}

function getVaccineSlots(form, vaccineName) {
    let slots = form["REQUIRED_VACCINES"][vaccineName];
    if (slots) {
        return { type: "required", name: vaccineName, slots: slots }
    }
    slots = form["RECOMMENDED_VACCINES"][vaccineName];
    if (slots) {
        return { type: "recommended", name: vaccineName, slots: slots }
    }

    return null;
}

function fillAtPosition({ pdfFile, page, text, position, config = {} }) {

    if (text == undefined) {
        return;
    }
    assert(pdfFile == undefined, "PDF file is undefined");

    const pdfPage = pdfFile.getPages()[page];
    assert(pdfPage == undefined, `${page} is not found`);

    const xPos = position.x;
    const yPos = position.y;
    const fontSize = config.fontSize ? config.fontSize : PDF_CONFIG.FONT_SIZE;

    pdfPage.drawText(text, {
        x: xPos,
        y: yPos,
        size: fontSize
    });
}

function fillField({
    pdfFile, page, field, data,
    form,
    config = { isOption: false }
}) {
    assert(data == undefined && !config.isOption, "data is undefined");

    assert(field == undefined, "field is undefined");
    const formField = form[field];

    console.log(`Filling field: ${field}`);
    fillAtPosition({
        pdfFile: pdfFile,
        page: page,
        text: data,
        position: formField.position,
        config: config
    })
}
function __fillVaccines({
    pdfFile, page, data, config = { isOption: true }, form
}) {
    assert(data == undefined && !config.isOption, "data is undefined");

    const vaccines = data;
    for (const vaccine of vaccines) {
        const vaccineName = vaccine.name;
        const slotsFromForm = getVaccineSlots(form, vaccineName);

        if (slotsFromForm == undefined) {
            console.log(`Form doesn't support vaccine ${vaccineName}`);
            continue;
        }

        console.log(`Filling Vaccine: ${vaccineName}. Type: ${slotsFromForm.type}`);

        const slotsPosition = slotsFromForm.slots;
        const slotsData = vaccine.slots;

        for (const slot of slotsData) {
            const slotName = slot.name;

            const pos = slotsPosition[slotName].position;
            const data = slot.date;

            console.log(`   Filling ${slotName}`);
            fillAtPosition({
                pdfFile: pdfFile,
                page: 0,
                text: data,
                position: pos,
                config: {
                    fontSize: 10
                }
            });
        }
    }
}
function fillVaccines(pdfFile, form, vaccines) {
    __fillVaccines({
        pdfFile: pdfFile,
        page: 0,
        data: vaccines,
        form: form
    });
}
function fillLastName(pdfFile, form, lastName) {
    fillField({
        pdfFile: pdfFile,
        page: 0,
        field: "LAST_NAME",
        form: form,
        data: lastName
    });
}
function fillFirstName(pdfFile, form, firstName) {
    fillField({
        pdfFile: pdfFile,
        page: 0,
        field: "FIRST_NAME",
        form: form,
        data: firstName
    });
}
function fillMiddleName(pdfFile, form, middleName) {
    fillField({
        pdfFile: pdfFile,
        page: 0,
        field: "MIDDLE_INITIAL",
        data: middleName,
        form: form,
        config: {
            isOption: true
        }
    });
}
function fillDOB(pdfFile, form, dob) {
    fillField({
        pdfFile: pdfFile,
        page: 0,
        form: form,
        field: "DOB",
        data: dob
    });
}


async function fillForm() {
    let CIS_FORM = await getStaticFile("cis-form.json");
    let USER_DATA = await getStaticFile("user-data.json");
    const filePath = path.join(__dirname, "../../static", "WA_DOH_CIS.pdf");

    try {

        const bytesArray = await fs.readFile(filePath);
        const pdfFile = await PDFDocument.load(bytesArray);

        fillLastName(pdfFile, CIS_FORM, USER_DATA.lastName);
        fillFirstName(pdfFile, CIS_FORM, USER_DATA.firstName);
        fillMiddleName(pdfFile, CIS_FORM, USER_DATA.middleName);
        fillDOB(pdfFile, CIS_FORM, USER_DATA.dateOfBirth);

        fillVaccines(pdfFile, CIS_FORM, USER_DATA.vaccines);

        const pdfBytes = await pdfFile.save();
        return pdfBytes;
    } catch (err) {
        console.error('Error reading the PDF file:', err);
    }
    return null;
    // Trigger the browser to download the PDF document
    // download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
}

module.exports.fillForm = fillForm;



// function fillForm() {
//     const filePath = path.join(__dirname, "../../static", "WA_DOH_CIS.pdf");
//
//     return fs.readFile(filePath)  // fs.readFile returns a promise
//         .then(data => {
//             const bytesArray = Array.from(data);
//             console.log('PDF file as byte array:', byteArray);
//
//             return PDFDocument.load(bytesArray);  // PDFDocument.load also returns a promise
//         })
//         .then(pdfFile => {
//             // Assuming CIS_FORM_ACTION methods return Promises, if not, you may need to handle them accordingly.
//             return Promise.all([
//                 CIS_FORM_ACTION.fillLastName(pdfFile, USER_DATA.lastName),
//                 CIS_FORM_ACTION.fillFirstName(pdfFile, USER_DATA.firstName),
//                 CIS_FORM_ACTION.fillMiddleName(pdfFile, USER_DATA.middleName),
//                 CIS_FORM_ACTION.fillDOB(pdfFile, USER_DATA.dateOfBirth),
//                 CIS_FORM_ACTION.fillVaccines(pdfFile, USER_DATA.vaccines)
//             ]).then(() => {
//                 return pdfFile.save();  // Assuming pdfFile.save() returns a promise
//             });
//         })
//         .then(pdfBytes => {
//             return pdfBytes;
//         })
//         .catch(err => {
//             console.error('Error processing the PDF file:', err);
//             return null;
//         });
// }
//
