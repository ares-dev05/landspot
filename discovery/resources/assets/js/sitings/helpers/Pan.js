import React, {Component} from 'react';

let document = window.document,
    coords = function (e) {
        const html = document.documentElement,
            get = function (e, lr) {
                let scr = 'scroll' + lr,
                    client = lr === 'Left' ? 'clientX' : 'clientY';
                return e[client] + (html[scr] ? html[scr] : document.body[scr]);
            };

        return 'touches' in e && e.touches.length ? {
            x: e.touches[0].pageX,
            y: e.touches[0].pageY
        } : {
            x: e.pageX || get(e, 'Left'),
            y: e.pageY || get(e, 'Top')
        };
    },

    dec = function (num) {
        if (typeof num !== 'number') {
            num = num * 1;
        }

        const n = num.toFixed(2) * 1;
        return Math.abs(n) > 0.2 ? n : 0;
    },

    pos,

    support = (typeof document.documentElement.style.WebkitTransform !== 'undefined'),

    touch = ('ontouchstart' in document),

    attach = ('attachEvent' in document),

    addEvent = function (elem, type, fn) {
        if (attach) {
            elem.attachEvent('on' + type, fn);
        } else if ('addEventListener' in document) {
            elem.addEventListener(type, fn);
        }
    },

    removeEvent = function (elem, type, fn) {
        if (attach) {
            elem.detachEvent('on' + type, fn);
        } else if ('removeEventListener' in document) {
            elem.removeEventListener(type, fn);
        }
    },

    retfalse = function () {
        return false;
    },

    getStyle = function (elem, m) {
        if ('defaultView' in document) {
            return document.defaultView.getComputedStyle(elem, '').getPropertyValue(m);
        } else if ('currentStyle' in elem) {
            return elem.currentStyle[m];
        }
    },

    setStyle = function (elem, styles) {
        for (let prop in styles) {
            elem.style[prop] = styles[prop];
        }
    },

    getWH = function (elem, m) {

        let offset = 'offset' + m.substr(0, 1).toUpperCase() + m.substr(1);

        if (elem[offset]) {
            return parseFloat(elem[offset]);
        }
        return parseFloat(getStyle(elem, m));
    },

    translate3d = function (elem, arr) {
        arr = arr || [0, 0, 0];
        for (let i in arr) {
            arr[i] += 'px';
        }
        elem.style.WebkitTransform = 'translate3d(' + arr.join(',') + ')';
    };

const defaultImageState = {
    options: {},
    elem: null,
    defaults: {
        mousemove: false,
        fps: 80,
        smoothness: 3.2
    },
    parent: window,
    move: false,
    decx: 0,
    decy: 0,
    x: 0,
    y: 0,
    dx: 0,
    cx: 0,
    dy: 0,
    cy: 0,
    minx: 0,
    miny: 0,
    mx: null,
    my: null,
    width: null,
    height: null,
    // hasPixelEvent: false,
    delta: 0,
};

class Pan extends Component {
    static imageData = {...defaultImageState};

    constructor(props) {
        super(props);

        this.state = {
            zoom: this.props.zoom || 100,
            resizeTS: this.props.resizeTS || 0,
            panUpdated: false
        };
    }

    componentDidMount() {
        this.initPan();
    }

    componentDidUpdate(prevProps) {
        const {resizeTS, zoom, resetPage} = this.props;
        if (resizeTS > this.state.resizeTS || zoom !== this.state.zoom) {
            this.onResize();
        }

        if (resetPage) {
            this.initPan();
        }
    }

    componentWillUnmount() {
        let imageData = {...Pan.imageData};
        removeEvent(imageData.parent, 'mousedown', this.onStart);
        removeEvent(imageData.parent, 'touchstart', this.onStart);
        removeEvent(imageData.parent, 'mouseup', this.onEnd);
        removeEvent(imageData.parent, 'touchend', this.onEnd);
        removeEvent(imageData.parent, 'mouseout', this.onEnd);
        removeEvent(window, 'resize', this.onResize);
        // removeEvent(parent, 'MozMousePixelScroll', this.onWheel);
        // removeEvent(parent, 'DOMMouseScroll', this.onWheel);
        // removeEvent(parent, 'mousewheel', this.onWheel);
        removeEvent(document, 'mousemove', this.onMove);

        if (attach) {
            document.detachEvent('ondragstart', retfalse);
        }

        Pan.imageData = {...Pan.imageData, elem: null};
    }

    static getDerivedStateFromProps(props, state) {
        const {
            panUpdated,
        } = state;
        let newState = {};

        if (panUpdated) {
            newState.panUpdated = false;
            Pan.loop();
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    initPan = () => {
        const {resetPage} = this.props;
        let imageData = resetPage ? {...defaultImageState} : {...Pan.imageData};

        if (!imageData.elem) {
            const elem       = document.getElementById('pan');
            imageData.elem   = elem;
            imageData.parent = elem.parentNode || window;
            // imageData.x = parseFloat(getStyle(elem, 'left')) || 0;
            // imageData.y = parseFloat(getStyle(elem, 'top')) || 0;
        }

        for (let d in imageData.defaults) {
            imageData.options[d] = d in imageData.options ? imageData.options[d] : imageData.defaults[d];
        }

        if (support) {

            imageData.elem.style.left = 0;
            imageData.elem.style.top  = 0;

            translate3d(imageData.elem, [imageData.x, imageData.y, 0]);

            let images = imageData.elem.getElementsByTagName('img'),
                i = 0;

            for (; images[i]; i++) {
                translate3d(images[i]);
            }
        }

        if (getStyle(imageData.parent, 'position') === 'static') {
            setStyle(imageData.parent, {position: 'relative'});
        }

        setStyle(imageData.elem, {position: 'absolute'});

        if (imageData.options.mousemove && !touch) {
            imageData.move = true;
            imageData.options.smoothness *= 5;
            addEvent(document, 'mousemove', this.onMove);
        } else {
            addEvent(imageData.parent, 'mousedown', this.onStart);
            addEvent(imageData.parent, 'mouseup', this.onEnd);
            addEvent(imageData.parent, 'mouseout', this.onEnd);
            // addEvent(imageData.parent, 'MozMousePixelScroll', this.onWheel);
            // addEvent(imageData.parent, 'DOMMouseScroll', this.onWheel);
            // addEvent(imageData.parent, 'mousewheel', this.onWheel);
        }


        addEvent(imageData.parent, 'touchstart', this.onStart);
        addEvent(imageData.parent, 'touchend', this.onEnd);

        addEvent(window, 'resize', this.onResize);

        Pan.imageData = imageData;

        // IE
        if (attach) {
            document.attachEvent('ondragstart', retfalse);
        }

        this.onResize();

        this.setState({panUpdated: true});
    };

    onResize = () => {
        let imageData    = {...Pan.imageData};
        imageData.width  = getWH(imageData.parent, 'width');
        imageData.height = getWH(imageData.parent, 'height');
        imageData.minx   = (getWH(imageData.elem, 'width') - imageData.width) * -1;
        imageData.miny   = (getWH(imageData.elem, 'height') - imageData.height) * -1;

        Pan.imageData    = imageData;
    };

    static loop = () => {
        let imageData = {...Pan.imageData};
        if (imageData.move === false) {
            return;
        }
        if (touch || !imageData.options.mousemove) {

            imageData.decx = dec((imageData.dx - imageData.cx) / imageData.options.smoothness);
            imageData.decy = dec((imageData.dy - imageData.cy) / imageData.options.smoothness);

            if (!imageData.move && (imageData.decx || imageData.decy)) {
                imageData.dx += imageData.decx;
                imageData.dy += imageData.decy;
                imageData.x  = imageData.dx = Math.min(0, Math.max(imageData.dx, imageData.minx));
                imageData.y  = imageData.dy = Math.min(0, Math.max(imageData.dy, imageData.miny));
            } else {
                imageData.decx = 0;
                imageData.decy = 0;
            }
        }

        imageData.mx = imageData.dx - imageData.cx;
        imageData.my = imageData.dy - imageData.cy;

        imageData.cx += dec(imageData.mx / imageData.options.smoothness);
        imageData.cy += dec(imageData.my / imageData.options.smoothness);

        // round up
        if (Math.abs(imageData.mx) < 0.8) {
            imageData.cx = Math.round(imageData.cx);
        }

        if (Math.abs(imageData.my) < 0.8) {
            imageData.cy = Math.round(imageData.cy);
        }

        if (imageData.cx || imageData.cy) {
            if (support) {
                translate3d(imageData.elem, [dec(imageData.cx), dec(imageData.cy), 0]);
            } else {
                imageData.elem.style.left = dec(imageData.cx) + 'px';
                imageData.elem.style.top = dec(imageData.cy) + 'px';
            }
        }

        Pan.imageData = imageData;
    };

    onMove = (e) => {
        let imageData = {...Pan.imageData};
        if (!imageData.move) {
            return;
        }

        try {
            e.preventDefault();
        } catch (err) {
            e.returnValue = false;
        }

        if (e.touches && e.touches.length > 1) {
            return;
        }

        pos = coords(e);

        if (imageData.options.mousemove && !touch) {
            imageData.dx = imageData.x - Math.abs(pos.x / imageData.width * imageData.minx);
            imageData.dy = imageData.y - Math.abs(pos.y / imageData.height * imageData.miny);
        } else {
            imageData.dx = pos.x - imageData.x;
            imageData.dy = pos.y - imageData.y;

            if (imageData.dx > 0) {
                imageData.x = pos.x;
            } else if (imageData.dx < imageData.minx) {
                imageData.x = pos.x - imageData.minx;
            }

            if (imageData.dy > 0) {
                imageData.y = pos.y;
            } else if (imageData.dy < imageData.miny) {
                imageData.y = pos.y - imageData.miny;
            }
        }
        imageData.dx = Math.min(0, Math.max(imageData.dx, imageData.minx));
        imageData.dy = Math.min(0, Math.max(imageData.dy, imageData.miny));

        Pan.imageData = imageData;
        this.setState({panUpdated: true});
    };

    onStart = (e) => {
        let imageData = {...Pan.imageData};

        try {
            e.preventDefault();
        } catch (err) {
            e.returnValue = false;
        }

        pos = coords(e);

        imageData.move = true;

        imageData.x = pos.x - imageData.x;
        imageData.y = pos.y - imageData.y;
        imageData.decx = 0;
        imageData.decy = 0;

        addEvent(document, 'mousemove', this.onMove);
        addEvent(document, 'touchmove', this.onMove);

        Pan.imageData = imageData;
        this.setState({panUpdated: true});
    };

    onEnd = () => {
        let imageData = {...Pan.imageData};
        imageData.move = false;
        imageData.x    = imageData.dx;
        imageData.y    = imageData.dy;

        removeEvent(document, 'mousemove', this.onMove);
        removeEvent(document, 'touchmove', this.onMove);

        Pan.imageData = imageData;
        this.setState({panUpdated: true});
    };

    // onWheel = (e) => {
    //     let imageData = {...Pan.imageData};
    //     // FF 3.6+
    //     if (e.type === 'MozMousePixelScroll') {
    //
    //         imageData.hasPixelEvent = true;
    //         imageData.delta = e.detail / -7;
    //
    //         // other gecko
    //     } else if (e.type === 'DOMMouseScroll') {
    //         if (imageData.hasPixelEvent) {
    //             removeEvent(e.currentTarget, e.type, arguments.callee);
    //             e.preventDefault();
    //             return false;
    //         } else {
    //             imageData.delta = e.detail * -3;
    //         }
    //
    //         // webkit + IE
    //     } else {
    //         imageData.delta = e.wheelDelta / 18;
    //     }
    //
    //     // webkit horizontal
    //     if ('wheelDeltaX' in e) {
    //         imageData.dx += e.wheelDeltaX / 18;
    //     }
    //
    //     // firefox horizontal
    //     if ('HORIZONTAL_AXIS' in e && e.axis === e.HORIZONTAL_AXIS) {
    //         imageData.dx += imageData.delta;
    //         return;
    //     }
    //
    //     imageData.dy += imageData.delta;
    //
    //     Pan.imageData = imageData;
    //     this.setState({panUpdated: true});
    // };

    render() {
        return (
            <div id="pan">
                {this.props.children}
            </div>
        );
    }
}

export default Pan;