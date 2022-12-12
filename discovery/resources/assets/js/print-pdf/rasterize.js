"use strict";
var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log('  image (png/jpg output) examples: "1920px" entire page, window width 1920px');
    console.log('                                   "800px*600px" window, clipped to 800x600');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    page.viewportSize = { width: 600, height: 600 };

    if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                           : { format: system.args[3], orientation: 'portrait', margin: '0' };
    }
    if (system.args.length > 3 && system.args[2].substr(-4) === ".png") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
            : { format: system.args[3], orientation: 'portrait', margin: '0' };
    }
    else if (system.args.length > 3 && system.args[3].substr(-2) === "px") {
        /*size = system.args[3].split('*');
        if (size.length === 2) {
            var pageWidth = parseInt(size[0], 10);
            var pageHeight = parseInt(size[1], 10);
            page.viewportSize = { width: pageWidth, height: pageHeight };
            page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
        } else {
            console.log("size:", system.args[3]);
            var pageWidth = parseInt(system.args[3], 10);
            var pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any
            console.log ("pageHeight:",pageHeight);
            page.viewportSize = { width: pageWidth, height: pageHeight };
        }*/
    }
    var headers = false;
    if (system.args.length > 4) {
        headers = true;
        //page.zoomFactor = system.args[4];
    }

    page.onConsoleMessage = function(msg) {
        system.stderr.writeLine( 'console: ' + msg );
    };

    page.open(address, function (status) {
        var pdfPaperOptions = page.evaluate(function() {
            document.body.style.zoom = 72/96;
            document.documentElement.classList.add('phantom-js');
            return window['pdfPaperOptions'];
        });

        if (pdfPaperOptions) {
            if(pdfPaperOptions.header) {
                pdfPaperOptions.header.contents = phantom.callback(function (pageNum, numPages) {
                    return pdfPaperOptions.header.__htmlContent;
                });
            }

            if(pdfPaperOptions.footer) {
                pdfPaperOptions.footer.contents = phantom.callback(function (pageNum, numPages) {
                    return pdfPaperOptions.footer.__htmlContent;
                });
            }
            page.paperSize = pdfPaperOptions;
        }

        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(1);
        } else {
            window.setTimeout(function () {
                page.render(output);
                phantom.exit();
            }, 5000);
        }
    });
}
