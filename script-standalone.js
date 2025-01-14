const { PDFDocument } = PDFLib

const STATIC_URL = {
    pdf: "./static/WA_DOH_CIS.pdf",
    formData: "./static/cis-form.json",
    userData: "./static/user-data.json"
}

const PDF_CONFIG = {
    FONT_SIZE: 18
}

function assert(condition, message) {
    if (condition) {
        throw new Error(message || "Assertion failed");
    }
}

let CIS_FORM;
let USER_DATA;

const UTILS = {
    generateRandomFileName: function() {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);

        return `WA_CIS_${timestamp}_${randomString}.pdf`;
    },
    executeHttp: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
        }
    },
    getVaccineSlots: function(vaccineName) {

        let slots = CIS_FORM["REQUIRED_VACCINES"][vaccineName];
        if (slots) {
            return { type: "required", name: vaccineName, slots: slots }
        }
        slots = CIS_FORM["RECOMMENDED_VACCINES"][vaccineName];
        if (slots) {
            return { type: "recommended", name: vaccineName, slots: slots }
        }

        return null;
    },
    fillAtPosition: function({ pdfFile, page, text, position, config = {} }) {

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
}

const CIS_FORM_ACTION = {
    fillField: function({ pdfFile, page, field, data,
        config = { isOption: false }
    }) {
        assert(data == undefined && !config.isOption, "data is undefined");

        assert(field == undefined, "field is undefined");
        const formField = CIS_FORM[field];

        console.log(`Filling field: ${field}`);
        UTILS.fillAtPosition({
            pdfFile: pdfFile,
            page: page,
            text: data,
            position: formField.position,
            config: config
        })
    },
    __fillVaccines: function({
        pdfFile, page, data, config = { isOption: true }
    }) {
        assert(data == undefined && !config.isOption, "data is undefined");

        const vaccines = data;
        for (const vaccine of vaccines) {
            const vaccineName = vaccine.name;
            const slotsFromForm = UTILS.getVaccineSlots(vaccineName);

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
                UTILS.fillAtPosition({
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
    },
    fillVaccines: function(pdfFile, vaccines) {
        this.__fillVaccines({
            pdfFile: pdfFile,
            page: 0,
            data: vaccines
        });
    },
    fillLastName: function(pdfFile, lastName) {
        this.fillField({
            pdfFile: pdfFile,
            page: 0,
            field: "LAST_NAME",
            data: lastName
        });
    },
    fillFirstName: function(pdfFile, firstName) {
        this.fillField({
            pdfFile: pdfFile,
            page: 0,
            field: "FIRST_NAME",
            data: firstName
        });
    },
    fillMiddleName: function(pdfFile, middleName) {
        this.fillField({
            pdfFile: pdfFile,
            page: 0,
            field: "MIDDLE_INITIAL",
            data: middleName,
            config: {
                isOption: true
            }
        });
    },
    fillDOB: function(pdfFile, dob) {
        this.fillField({
            pdfFile: pdfFile,
            page: 0,
            field: "DOB",
            data: dob
        });
    }
}

async function fillForm(url, formData, data) {
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

    console.log(existingPdfBytes.length);
    const pdfFile = await PDFDocument.load(existingPdfBytes);

    CIS_FORM_ACTION.fillLastName(pdfFile, USER_DATA.lastName);
    CIS_FORM_ACTION.fillFirstName(pdfFile, USER_DATA.firstName);
    CIS_FORM_ACTION.fillMiddleName(pdfFile, USER_DATA.middleName);
    CIS_FORM_ACTION.fillDOB(pdfFile, USER_DATA.dateOfBirth);

    CIS_FORM_ACTION.fillVaccines(pdfFile, USER_DATA.vaccines);

    const pdfBytes = await pdfFile.save()

    // Trigger the browser to download the PDF document
    download(pdfBytes, UTILS.generateRandomFileName(), "application/pdf");
}

document.addEventListener("DOMContentLoaded", async function() {
    CIS_FORM = await UTILS.executeHttp(STATIC_URL.formData);
    USER_DATA = await UTILS.executeHttp(STATIC_URL.userData);
});

document.getElementById("filling_button").addEventListener("click", async function() {
    await fillForm(STATIC_URL.pdf, CIS_FORM, USER_DATA);
});
