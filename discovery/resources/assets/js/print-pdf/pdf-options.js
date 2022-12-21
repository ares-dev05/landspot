window.pdfPaperOptions = {
    width: '210mm',
    height: '297mm',
    orientation: 'portrait',
    format: 'A4',
    margin: {
        top: '10mm',
        left: '10mm',
        bottom: '10mm',
        right: '10mm',
    },

    header: {
        height: "25mm",
        //contents:
        __htmlContent: document.body.querySelector('header').innerHTML
    },

    footer: {
        height: "25mm",
        //contents:
        __htmlContent: document.body.querySelector('footer').innerHTML
    }
};