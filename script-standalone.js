const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib

const FORM_URL = "/WA_DOH_CIS.pdf";

const PDF_CONFIG = {
    FONT_SIZE: 18
}

const CIS_FORM = {
    "LAST_NAME": { position: { x: 25, y: 500 } },
    "FIRST_NAME": { position: { x: 240, y: 500 } },
    "MIDDLE_INITIAL": { position: { x: 460, y: 500 } },
    "DOB": { position: { x: 590, y: 500 } },
    "VACCINES_REQUIRED": {
        "DTAP": {
            "slot#1": { position: { x: 218, y: 340 } },
            "slot#2": { position: { x: 277, y: 340 } },
            "slot#3": { position: { x: 336, y: 340 } },
            "slot#4": { position: { x: 395, y: 340 } },
            "slot#5": { position: { x: 454, y: 340 } },
            "slot#6": { position: { x: 513, y: 340 } }
        },
        "TDAP": {
            "slot#1": { position: { x: 218, y: 324 } },
            "slot#2": { position: { x: 277, y: 324 } },
            "slot#3": { position: { x: 336, y: 324 } },
            "slot#4": { position: { x: 395, y: 324 } },
            "slot#5": { position: { x: 454, y: 324 } },
            "slot#6": { position: { x: 513, y: 324 } }
        },
        "DT": {
            "slot#1": { position: { x: 218, y: 308 } },
            "slot#2": { position: { x: 277, y: 308 } },
            "slot#3": { position: { x: 336, y: 308 } },
            "slot#4": { position: { x: 395, y: 308 } },
            "slot#5": { position: { x: 454, y: 308 } },
            "slot#6": { position: { x: 513, y: 308 } }
        },
        "HAPATITIS_B": {
            "slot#1": { position: { x: 218, y: 292 } },
            "slot#2": { position: { x: 277, y: 292 } },
            "slot#3": { position: { x: 336, y: 292 } },
            "slot#4": { position: { x: 395, y: 292 } },
            "slot#5": { position: { x: 454, y: 292 } },
            "slot#6": { position: { x: 513, y: 292 } }
        },
        "HIB": {
            "slot#1": { position: { x: 218, y: 276 } },
            "slot#2": { position: { x: 277, y: 276 } },
            "slot#3": { position: { x: 336, y: 276 } },
            "slot#4": { position: { x: 395, y: 276 } },
            "slot#5": { position: { x: 454, y: 276 } },
            "slot#6": { position: { x: 513, y: 276 } }
        },
        "IPV": {
            "slot#1": { position: { x: 218, y: 260 } },
            "slot#2": { position: { x: 277, y: 260 } },
            "slot#3": { position: { x: 336, y: 260 } },
            "slot#4": { position: { x: 395, y: 260 } },
            "slot#5": { position: { x: 454, y: 260 } },
            "slot#6": { position: { x: 513, y: 260 } }
        },
        "OPV": {
            "slot#1": { position: { x: 218, y: 240 } },
            "slot#2": { position: { x: 277, y: 240 } },
            "slot#3": { position: { x: 336, y: 240 } },
            "slot#4": { position: { x: 395, y: 240 } },
            "slot#5": { position: { x: 454, y: 240 } },
            "slot#6": { position: { x: 513, y: 240 } }
        },
        "MMR": {
            "slot#1": { position: { x: 218, y: 224 } },
            "slot#2": { position: { x: 277, y: 224 } },
            "slot#3": { position: { x: 336, y: 224 } },
            "slot#4": { position: { x: 395, y: 224 } },
            "slot#5": { position: { x: 454, y: 224 } },
            "slot#6": { position: { x: 513, y: 224 } }
        },
        "PCV/PPSV": {
            "slot#1": { position: { x: 218, y: 204 } },
            "slot#2": { position: { x: 277, y: 204 } },
            "slot#3": { position: { x: 336, y: 204 } },
            "slot#4": { position: { x: 395, y: 204 } },
            "slot#5": { position: { x: 454, y: 204 } },
            "slot#6": { position: { x: 513, y: 204 } }
        },
        "VARICELLA": {
            "slot#1": { position: { x: 218, y: 180 } },
            "slot#2": { position: { x: 277, y: 180 } },
            "slot#3": { position: { x: 336, y: 180 } },
            "slot#4": { position: { x: 395, y: 180 } },
            "slot#5": { position: { x: 454, y: 180 } },
            "slot#6": { position: { x: 513, y: 180 } }
        }
    },
    "VACCINES_RECOMMENDED": {

    },
}

function getVaccineSlots(vaccineName) {
    let slots = CIS_FORM["VACCINES_REQUIRED"][vaccineName];
    if (slots) {
        return { type: "required", name: vaccineName, slots: slots }
    }
    slots = CIS_FORM["VACCINES_RECOMMENDED"][vaccineName];
    if (slots) {
        return { type: "recommended", name: vaccineName, slots: slots }
    }

    return null;
}

function assert(condition, message) {
    if (condition) {
        throw new Error(message || "Assertion failed");
    }
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

const CIS_FORM_ACTION = {
    fillField: function({ pdfFile, page, field, data,
        config = { isOption: false }
    }) {
        assert(data == undefined && !config.isOption, "data is undefined");

        assert(field == undefined, "field is undefined");
        const formField = CIS_FORM[field];

        console.log(`Filling field: ${field}`);
        fillAtPosition({
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
            const slotsFromForm = CIS_FORM.getVaccineSlots(vaccineName);

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

const USER_DATA = {
    firstName: "L",
    lastName: "D",
    dateOfBirth: "11/02/2020",
    vaccines: [
        {
            name: "DTAP",
            slots: [
                { name: "slot#1", date: "11/02/2022" },
                { name: "slot#2", date: "11/02/2022" },
                { name: "slot#3", date: "11/02/2022" },
                { name: "slot#4", date: "11/02/2022" },
                { name: "slot#5", date: "11/05/2022" },
                { name: "slot#6", date: "11/10/2022" }
            ]
        },
        {
            name: "TDAP",
            slots: [
                { name: "slot#1", date: "11/02/2022" },
                { name: "slot#2", date: "11/02/2022" },
                { name: "slot#3", date: "11/02/2022" },
                { name: "slot#4", date: "11/02/2022" },
                { name: "slot#5", date: "11/05/2022" },
                { name: "slot#6", date: "11/10/2022" }
            ]
        },
        {
            name: "DT",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "MMR",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "OPV",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "HAPATITIS_B",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "HIB",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "VARICELLA",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "IPV",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        },
        {
            name: "PCV/PPSV",
            slots: [
                { name: "slot#1", date: "01/01/2023" },
                { name: "slot#2", date: "01/10/2023" },
                { name: "slot#3", date: "01/20/2023" },
                { name: "slot#4", date: "02/01/2023" },
                { name: "slot#5", date: "02/10/2023" },
                { name: "slot#6", date: "02/20/2023" }
            ]
        }
    ]
};

async function fillForm(url, formData, data) {
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

    const pdfFile = await PDFDocument.load(existingPdfBytes);

    CIS_FORM_ACTION.fillLastName(pdfFile, USER_DATA.lastName);
    CIS_FORM_ACTION.fillFirstName(pdfFile, USER_DATA.firstName);
    CIS_FORM_ACTION.fillMiddleName(pdfFile, USER_DATA.middleName);
    CIS_FORM_ACTION.fillDOB(pdfFile, USER_DATA.dateOfBirth);

    CIS_FORM_ACTION.fillVaccines(pdfFile, USER_DATA.vaccines);

    const pdfBytes = await pdfFile.save()

    // Trigger the browser to download the PDF document
    download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
}


document.getElementById("filling_button").addEventListener("click", async function() {
    await fillForm(FORM_URL, CIS_FORM, USER_DATA);
});
