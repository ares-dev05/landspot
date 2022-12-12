const slides = document.getElementsByClassName('slides'),
    prev = document.getElementById('prev'),
    next = document.getElementById('next');

function slide(item, prev, next) {
    let posX1 = 0,
        posX2 = 0,
        posInitial,
        posFinal,
        threshold = 100,
        slides = item.getElementsByClassName('slide'),
        slidesLength = slides.length,
        slideSize = item.getElementsByClassName('slide')[0].offsetWidth,
        firstSlide = slides[0],
        lastSlide = slides[slidesLength - 1],
        cloneFirst = firstSlide.cloneNode(true),
        cloneLast = lastSlide.cloneNode(true),
        index = 0,
        allowShift = true;

    // Clone first and last slide
    item.appendChild(cloneFirst);
    item.insertBefore(cloneLast, firstSlide);

    const dots = item.parentNode.parentNode.querySelector('.dots');

    for (let i = 0; i < slidesLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i === 0) {
            dot.classList.add('active');
        }
        dots.append(dot);
    }

    // Mouse events
    item.onmousedown = dragStart;

    // Touch events
    item.addEventListener('touchstart', dragStart);
    item.addEventListener('touchend', dragEnd);
    item.addEventListener('touchmove', dragAction);

    // Click events
    if (prev) {
        prev.addEventListener('click', function () {
            shiftSlide(-1);
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            shiftSlide(1);
        });
    }

    // Transition events
    item.addEventListener('transitionend', checkIndex);

    function dragStart(e) {
        e = e || window.event;
        e.preventDefault();
        posInitial = item.offsetLeft;

        if (e.type === 'touchstart') {
            posX1 = e.touches[0].clientX;
        } else {
            posX1 = e.clientX;
            document.onmouseup = dragEnd;
            document.onmousemove = dragAction;
        }
    }

    function dragAction(e) {
        e = e || window.event;

        if (e.type === 'touchmove') {
            posX2 = posX1 - e.touches[0].clientX;
            posX1 = e.touches[0].clientX;
        } else {
            posX2 = posX1 - e.clientX;
            posX1 = e.clientX;
        }
        item.style.left = (item.offsetLeft - posX2) + 'px';
    }

    function dragEnd(e) {
        posFinal = item.offsetLeft;
        if (posFinal - posInitial < -threshold) {
            shiftSlide(1, 'drag');
        } else if (posFinal - posInitial > threshold) {
            shiftSlide(-1, 'drag');
        } else {
            item.style.left = (posInitial) + 'px';
        }

        document.onmouseup = null;
        document.onmousemove = null;
    }

    function shiftSlide(dir, action) {
        item.classList.add('shifting');

        if (allowShift) {
            if (!action) {
                posInitial = item.offsetLeft;
            }

            if (dir === 1) {
                item.style.left = (posInitial - slideSize) + 'px';
                index++;
            } else if (dir === -1) {
                item.style.left = (posInitial + slideSize) + 'px';
                index--;
            }

            const dotElem = dots.getElementsByClassName('dot');
            for (let i = 0; i < dotElem.length; i++) {
                dotElem[i].classList.remove('active');
            }
            let activeElem;
            if (index < 0) {
                activeElem = slidesLength - 1;
            } else if (index >= slidesLength) {
                activeElem = 0;
            } else {
                activeElem = index;
            }
            dotElem[activeElem].classList.add('active');
        }

        allowShift = false;
    }

    function checkIndex() {
        item.classList.remove('shifting');

        if (index === -1) {
            item.style.left = -(slidesLength * slideSize) + 'px';
            index = slidesLength - 1;
        }

        if (index === slidesLength) {
            item.style.left = -(1 * slideSize) + 'px';
            index = 0;
        }

        allowShift = true;
    }
}

for (const slider of slides){
    slide(slider, prev, next);
}
