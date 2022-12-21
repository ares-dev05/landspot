
export default class PdfPage {

    static get SIZE_A4() { return 0; }
    static get SIZE_A3() { return 1; }

    static get DPI_72()  { return 72; }
    static get DPI_144() { return 144; }
    static get DPI_200() { return 200; }

    /**
     * @param size {number} one of the SIZE_ constants
     * @param dpi  {number} multiplication factor to apply to the size. When=1, the size is returned in inches.
     *      When one of the DPI_ constants, the size is returned in number of dots (pixels) the resulting page will have.
     *
     * @returns {{width: number, height: number}}
     */
    static pageSize(size, dpi=1) {
        switch (size) {
            case this.SIZE_A4:
                return {
                     width: dpi*8.3,
                    height: dpi*11.7
                };

            case this.SIZE_A3:
                return {
                     width: dpi*11.7,
                    height: dpi*16.5
                };
        }

        return {width: 0, height: 0};
    }
}