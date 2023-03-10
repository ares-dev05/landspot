const baseUrl = document.currentScript.getAttribute('data-url') + '/api/v1/'; //TODO: change after

const token = document.currentScript.getAttribute('data-token');

const appendJqueryScript = () => {
    const jquery = document.createElement('script');
    jquery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    jquery.type = 'text/javascript';

    document.getElementsByTagName('head')[0].appendChild(jquery);
};

const appendJqueryUiScript = () => {
    const jqueryui = document.createElement('script');
    jqueryui.src = 'https://code.jquery.com/ui/1.13.0-rc.2/jquery-ui.min.js';
    jqueryui.type = 'text/javascript';

    document.getElementsByTagName('head')[0].appendChild(jqueryui);
};

const appendPaginationJsScript = () => {
    const jquery = document.createElement('script');
    jquery.src = 'https://cdnjs.cloudflare.com/ajax/libs/simplePagination.js/1.4/jquery.simplePagination.min.js';
    jquery.type = 'text/javascript';

    document.getElementsByTagName('head')[0].appendChild(jquery);
};

const appendLeafLetMap = () => {
    const mapScript = document.createElement('script');
    mapScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    mapScript.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
    mapScript.crossOrigin = '';
    mapScript.type = 'text/javascript';

    document.getElementsByTagName('head')[0].appendChild(mapScript);

    const mapStyle = document.createElement('link');
    mapStyle.rel = 'stylesheet';
    mapStyle.type = 'text/css';
    mapStyle.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    mapStyle.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    mapStyle.crossOrigin = '';
    document.head.appendChild(mapStyle);
};


const styles = '';

const appendStyles = () => {
    const styleSheet = document.createElement('style');
    styleSheet.rel = 'stylesheet';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.type = 'text/css';
    font.href = 'https://fonts.googleapis.com/css2?family=Montserrat&display=swap';
    document.head.appendChild(font);
};

const main = async () => {
    const ajaxSettings = {
        'async': true,
        'crossDomain': true,
        'method': 'get',
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    const initQueryParam = {
        per_page: 5
    };

    $.ajaxthrottle = function (options) {

        let timeout,

            settings = $.extend({
                numRequestsPerTimePeriod: 0,
                timePeriod: 0,
                maxConcurrent: 1
            }, options),

            time = function () {
                return (new Date()).getTime();
            },
            outstanding_reqs = [],
            initiated_reqs = [],
            waiting_reqs = [],
            purge_initiated_reqs = function (now) {
                if (settings.timePeriod >= 0) {
                    while ((initiated_reqs.length > 0)
                    &&
                    (initiated_reqs[0].time + settings.timePeriod - now <= 0)) {
                        initiated_reqs.shift();
                    }
                    if (initiated_reqs.length > 0) {
                        return initiated_reqs[0].time + settings.timePeriod - now;
                    }
                }
                return 0;
            },
            remove_outstanding_req = function (obj) {
                $.each(outstanding_reqs, function (i) {
                    if (outstanding_reqs[i] === obj) {
                        outstanding_reqs.splice(i, 1);
                        return false;
                    }
                    return true;
                });
            },
            process_waiting = function () {
                let now = time(),
                    delay, req, deferred;

                if (waiting_reqs.length <= 0) {
                    return;
                }

                delay = purge_initiated_reqs(now);
                if ((settings.numRequestsPerTimePeriod > 0) && (settings.timePeriod > 0)
                    &&
                    (delay > 0)
                    &&
                    (initiated_reqs.length >= settings.numRequestsPerTimePeriod)) {
                    if (timeout !== undefined) {
                        clearTimeout(timeout);
                    }
                    timeout = setTimeout(function () {
                        timeout = undefined;
                        process_waiting();
                    }, delay);
                    return;
                }
                if ((settings.maxConcurrent > 0)
                    &&
                    (outstanding_reqs.length >= settings.maxConcurrent)) {
                    return;
                }
                req = waiting_reqs.shift();
                req.time = time();
                initiated_reqs.push(req);
                outstanding_reqs.push(req);
                $.ajax.apply($, req.arguments).done(function () {
                    req.deferred.resolve.apply(req.deferred, arguments);
                }).fail(function () {
                    req.deferred.reject.apply(req.deferred, arguments);
                }).always(function () {
                    remove_outstanding_req(req);
                    process_waiting();
                });

            };

        return {
            ajax: function () {
                const deferred = $.Deferred();
                waiting_reqs.push({arguments: arguments, deferred: deferred});
                process_waiting();
                return deferred.promise();
            }
        };
    };

    const throttle = $.ajaxthrottle({
        numRequestsPerTimePeriod: 2,
        timePeriod: 1000,
        maxConcurrent: 1
    });

    const requestData = () => {
        const query = {...$.QueryString};
        if (query.suburbs) {
            query.suburbs = query.suburbs.join(',');
        }
        return query;
    };

    const setQueryParams = (key = '', value = '', asArray = false) => {
        const searchParams = new URLSearchParams(window.location.search);
        if (asArray) {
            let queryValues = searchParams.get(key);
            queryValues = queryValues ? queryValues.split(',') : [];
            if (!queryValues.includes(value)) {
                const param = queryValues.length ? queryValues.join(',') + ',' + value : value;
                searchParams.set(key, param);
            }
        } else searchParams.set(key, value);
        window.history.pushState({}, '', '?' + searchParams);
        $.QueryString = getAllQueryParams();
    };

    const getAllQueryParams = () => {
        const search = new URLSearchParams(window.location.search);
        const params = Array.from(search.entries()).reduce((result, [key = '', value = '']) => ({
            ...result,
            [key]: key.includes('suburbs')
                ? value.split(',')
                : value
        }), {});
        return $.isEmptyObject(params) ? initQueryParam : {...initQueryParam, ...params};
    };

    $.QueryString = getAllQueryParams();

    (function setInitQueryParams() {
        Object.entries($.QueryString).forEach(([key, value]) => {
            setQueryParams(key, value);
        });
    })();

    const removeQueryParam = (key = '', value = '') => {
        const searchParams = new URLSearchParams(window.location.search);
        if (value) {
            let queryValues = searchParams.get(key);
            queryValues = queryValues ? queryValues.split(',') : [];
            queryValues = queryValues.filter(item => item !== value);
            searchParams.delete(key);
            const param = queryValues.join(',');
            if (param) {
                searchParams.set(key, param);
            }
        } else searchParams.delete(key);
        window.history.pushState({}, '', '?' + searchParams);
        $.QueryString = getAllQueryParams();
    };

    const availableSuburbsUrl = baseUrl + 'available-suburbs';
    const {data: availableSuburbs} = await $.ajax({...ajaxSettings, url: availableSuburbsUrl})
        .fail(error => {
            throw new Error('Fetch available suburbs error - ' + error?.statusText);
        });

    const renderBuildOptions = () => {
        setScrollPosition();
        const buildOptionsUrl = baseUrl + 'build-options';
        throttle.ajax({...ajaxSettings, url: buildOptionsUrl, data: requestData()})
            .done(function (data) {
                $('#build-options-api').html(BuildOptions(data));
                appendAutocomplete();
                appendSuburbsFromQueryString();
                appendPagination(data.pagination);
                selectLastPageAsNeeded(data.pagination);
                applyScrollPosition();
            })
            .fail(error => {
                throw new Error('Fetch build options error - ' + error?.statusText);
            });
    };

    const renderBuildOption = (id) => {
        const buildOptionsUrl = baseUrl + 'build-options' + '/' + id;
        throttle.ajax({...ajaxSettings, url: buildOptionsUrl})
            .done(function (data) {
                $('#build-options-api').html(BuildOption(data));
                window.scrollTo(0, 0);
                appendMap(data);
            })
            .fail(error => {
                throw new Error('Fetch build options error - ' + error?.statusText);
            });
    };

    const handleSelectSuburbs = (event, ui) => {
        event.preventDefault();
        const input = $('#searchSuburbs');
        if ($.QueryString.suburbs?.includes(ui.item.value.toLowerCase())) {
            input.val('');
            return false;
        }
        setQueryParams('suburbs', ui.item.value.toLowerCase(), true);
        renderBuildOptions();
        appendSelectedSuburbs();
        input.val('');
    };

    const appendAutocomplete = () => {
        $('#searchSuburbs').autocomplete({
            source: availableSuburbs,
            appendTo: '.suburb-menu',
            select: handleSelectSuburbs
        });
        $('.ui-helper-hidden-accessible').remove();
    };

    const appendSuburbsFromQueryString = () => {
        if (!$.QueryString.suburbs) return;
        appendSelectedSuburbs();
    };

    const appendSelectedSuburbs = () => {
        const appendSuburbsParent = $('.selected-suburbs');
        appendSuburbsParent.empty();
        $.QueryString.suburbs.forEach(suburb => {
            appendSuburbsParent.append(`<div class='selected-suburb'>${suburb}</div>`);
        });
        appendSuburbsParent.on('click', '*', function (e) {
            const text = $(this).text().toLowerCase();
            appendSuburbsParent.contents().filter(function () {
                return $(this).text().toLowerCase() === text;
            }).remove();
            removeQueryParam('suburbs', text);
            renderBuildOptions();
        });
    };

    const appendPagination = (pagination) => {
        $('#pagination-container').pagination({
            items: pagination.total,
            itemsOnPage: pagination.per_page,
            prevText: '&laquo;',
            nextText: '&raquo;',
            displayedPages: 3,
            currentPage: pagination.current_page,
            // hrefText: window.location.search + '&page=',
            hrefText: '#',
            onPageClick: function (pageNumber) {
                setQueryParams('page', pageNumber);
                renderBuildOptions();
                return false;
            }
        });
    };

    const selectLastPageAsNeeded = (pagination) => {
        if (pagination.current_page <= pagination.total_pages) return;
        setQueryParams('page', pagination.total_pages);
        renderBuildOptions();
    };

    const applyScrollPosition = () => {
        const scrollY = localStorage.getItem('buildOptionsScrollY');
        if (scroll) {
            window.scrollTo(0, parseInt(scrollY));
        }
    };

    const setScrollPosition = () => {
        localStorage.setItem('buildOptionsScrollY', window.scrollY.toString());
    };

    const appendMap = ({data}) => {
        const initCoords = data.estate.geo_coords || [-37.840935, 144.946457]; //Melbourne
        // eslint-disable-next-line no-undef
        $.leafletMap = L.map('leaflet-map').setView(initCoords, 10);

        // eslint-disable-next-line no-undef
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWVob3JuYXphcmVua28iLCJhIjoiY2t2YXhwZThlMDg5bTJwcG5ycGg4YW5vbCJ9.OZg0tXtfhujtQYPF7xn5XQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 20,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoieWVob3JuYXphcmVua28iLCJhIjoiY2t2YXhwZThlMDg5bTJwcG5ycGg4YW5vbCJ9.OZg0tXtfhujtQYPF7xn5XQ'
        }).addTo($.leafletMap);

        // eslint-disable-next-line no-undef
        const marker = L.marker(data.estate.geo_coords).addTo($.leafletMap);
        marker.bindPopup(`<img style='width: 75px; height: 75px; object-fit: cover' src=${data.estate.logo} alt=${data.estate.name}><br><b style='text-align: center'>${data.estate.name}</b>`).openPopup();
    };

    $.handleChangeBedroom = e => {
        $.QueryString.beds != e.value
            ? setQueryParams('beds', e.value)
            : removeQueryParam('beds');
        renderBuildOptions();
    };

    $.handleChangeBathroom = e => {
        $.QueryString.bathrooms != e.value
            ? setQueryParams('bathrooms', e.value)
            : removeQueryParam('bathrooms');
        renderBuildOptions();
    };

    $.handleChangeStorey = e => {
        $.QueryString.storey != e.value
            ? setQueryParams('storey', e.value)
            : removeQueryParam('storey');
        renderBuildOptions();
    };

    $.handlePerPageInput = (e, max) => {
        e.value = e.value > max ? Math.abs(max) : Math.abs(e.value);
        setQueryParams('per_page', e.value);
    };

    $.handlePerPageKeyDown = () => {
        renderBuildOptions();
    };

    $.handleViewOptions = e => {
        renderBuildOption(e.getAttribute('data-id'), {name: 'buildOptions'});
    };

    $.handleToBuildOptions = () => {
        renderBuildOptions();
    };

    $.handleViewSitePlan = e => {
        const house = JSON.parse(e.getAttribute('data-house'));
        const eventLot = JSON.parse(e.getAttribute('data-lot'));
        const lotLowerPrice = new Intl.NumberFormat().format(Math.min(...house.estate.lots.map(lot => lot.price)));
        $('.site-plan-cards').children().each((index, element) => {
            const id = element.getAttribute('data-id');
            const lot = house.estate.lots.find(item => parseInt(item.id) === parseInt(id));
            element.outerHTML = parseInt(eventLot.id) === parseInt(id) ? BuildOptionsOpenedLot(lot, lotLowerPrice, house.title) : BuildOptionsLot(lot, house);
        });
    };

    $.handleViewMoreLots = e => {
        $.IsViewMoreLots = !$.IsViewMoreLots;
        const house = JSON.parse(e.getAttribute('data-house'));
        const lotLowerPrice = new Intl.NumberFormat().format(Math.min(...house.estate.lots.map(lot => lot.price)));
        let selectedLotElement = null;
        const sitePlanCards = $('.site-plan-cards');
        sitePlanCards.children().each((index, element) => {
            const selected = element.getAttribute('data-lot-selected');
            if (selected) {
                selectedLotElement = {element, index};
            }
        });
        sitePlanCards.empty();
        house.estate.lots.forEach((lot, index) => {
            const selected = selectedLotElement && selectedLotElement?.index === index;
            sitePlanCards.append(selected ? BuildOptionsOpenedLot(lot, lotLowerPrice, house.title) : BuildOptionsLot(lot, house));
        });
        $('.site-plans-view-more').remove();
    };

    renderBuildOptions();
};

appendJqueryScript();
appendStyles();
appendLeafLetMap();

const start = async () => {
    if (window.jQuery && window.jQuery.ui) {
        await main();
    } else {
        setTimeout(async () => {
            await start();
        }, 50);
    }
};

window.onload = async () => {
    appendJqueryUiScript();
    appendPaginationJsScript();
    await start();
};

const BuildOptions = data => {
    const {data: houses, pagination} = data;
    return (
        `<main class="estate-options">
            <div>
                <div class="main-container">
                    <div class="text-title">Select your House Requirements</div>
                    <div class="requirements">
                        <div class="options">
                            <div class="option-name">Bedrooms</div>
                            <div class="options-container">
                             ${Bedrooms()}
                            </div>
                        </div>
                        <div class="options">
                            <div class="option-name">Bathrooms</div>
                            <div class="options-container">
                            ${Bathrooms()}
                            </div>
                        </div>
                        <div class="options">
                            <div class="option-name">Storey</div>
                            <div class="options-container">
                            ${Storey()}
                            </div>
                        </div>
                    </div>
                    <div class="text-title">What suburb do you want to build around?</div>
                    <div class="suburb-input">
                        <div style="display: inline-block;" class='ui-widget'>
                            <input placeholder="Suburb" role="combobox"  aria-autocomplete="list" id='searchSuburbs' aria-expanded="false" autoComplete="off" value="">
                            <div class='suburb-menu'></div>
                        </div>
                        <div class="selected-suburbs"></div>
                    </div>
                    <div class="text-big-title">${pagination.total} build options ${$.QueryString.suburbs ? 'around ' + `<span>${$.QueryString.suburbs.join(', ')}</span>` : ''}</div>                    
                     ${Houses(houses)}
                     ${BuildOptionsPagination(pagination)}
                </div>
            </div>               
        </main>`
    );
};

const BuildOption = ({data: house}) => {
    return `
     <main class="estate-options">
        <div id="estate-options">
            <div class="main-container">
                <div class="back-nav" onclick='$.handleToBuildOptions(this)'><i></i><span>Back to all estates</span></div>
                <div class="text-big-title">${house.title} at <span>${house.estate.name} Estate</span></div>
                <div class="text-description">Set your eyes on this lakefront home with breathtaking views: just one look and you will fall in love this beautiful modern home tucked in the pines with breathtaking views of lake. This spacious 4-bedroom, 3.5-bathroom home has an oversized 3-car garage and 3,800 sq. ft. of spacious room to call home</div>
                <div class="house-image" style="background-image: url(${house.image});"></div>
                <div class="description"> This design fits on<span class="lots-highlight"> ${house.estate.lots_count} Lots</span> at <span class="text-bold lots-suburubs">${house.estate.name} Estate, ${house.estate.suburb}</span>
                ${BuildOptionsLots(house)}
                ${house.estate.lots_count > 4 ? `<div class="site-plans-view-more" data-house='${JSON.stringify(house)}' onclick='$.handleViewMoreLots(this)'>View More</div>` : ''} 
                <div class="description">
                    <div class="text-bold">${house.estate.name} Estate</div>
                    <div class="text-description">Set your eyes on this lakefront home with breathtaking views: just one look and you will fall in love this beautiful modern home tucked in the pines with breathtaking views of lake. This spacious 4-bedroom, 3.5-bathroom home has an oversized 3-car garage and 3,800 sq. ft. of spacious room to call home.</div>
                </div>             
                <div>
                    <div class="location-conditions-cards">
                     ${BuildOptionsEstateSnapshots(house.estate.snapshots)}
                    </div>
                    <div class="estate-map-section">
                        <div class="estates-map" style="visibility: visible; transform: translateX(0px);">                           
                            <div id="leaflet-map"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>       
     </main>`;
};

const Bedrooms = () => ([1, 2, 3, 4, 5, 6].map(bed =>
        `<input onclick='$.handleChangeBedroom(this)' type='radio' id='radioBedroom${bed}' class="option" name="options-bedrooms" value=${bed} ${bed == $.QueryString.beds ? 'checked' : ''}>
         <label for='radioBedroom${bed}'>${bed}</label>`
    ).join('')
);

const Bathrooms = () => ([1, 2, 3, 4, 5].map(bath =>
        `<input onclick='$.handleChangeBathroom(this)' type='radio' id='radioBathroom${bath}' class="option" name="options-bathrooms" value=${bath} ${bath == $.QueryString.bathrooms ? 'checked' : ''}>
        <label for='radioBathroom${bath}'>${bath}</label>`
    ).join('')
);

const Storey = () => (['Single', 'Double'].map(storey =>
        `<input onclick='$.handleChangeStorey(this)' type='radio' id='radioStorey${storey}' class="option" name="options-storey" value=${storey.toLowerCase()} ${storey.toLowerCase() === $.QueryString.storey ? 'checked' : ''}>
        <label for='radioStorey${storey}'>${storey}</label>`
    ).join('')
);

const Houses = (houses) => houses.map(house =>
    `<div class="presentation-card">
        <div class="text-bold">${house.title}</div>
            <div class="options">
                <i class="landspot-icon bedroom" aria-hidden="true">
                    <svg width="26px" height="23px" viewBox="0 0 26 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="Icon---Bedroom-(Small)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                            <g id="Group-5" transform="translate(1.000000, 6.000000)" stroke="#323337" stroke-width="0.75">
                                <polyline id="Stroke-1" points="24.1999601 13.1880704 24.1999601 0 5.99912991 0 0 0 0 13.1880704"></polyline>
                                <path d="M24.1999601,13.6126743 L0,13.6126743 L0,9.34551072 C0,7.591115 1.3775913,6.16837507 3.0775758,6.16837507 L21.1223843,6.16837507 C22.8223688,6.16837507 24.1999601,7.591115 24.1999601,9.34551072 L24.1999601,13.6126743 Z" id="Path"></path>
                                <path d="M10.4250705,6.09625468 L4.20851071,6.09625468 C3.68858769,6.09625468 3.26691785,5.49284746 3.26691785,4.7488405 C3.26691785,4.00483353 3.68858769,3.40142631 4.20851071,3.40142631 L10.4250705,3.40142631 C10.9439701,3.40142631 11.3656399,4.00483353 11.3656399,4.7488405 C11.3656399,5.49284746 10.9439701,6.09625468 10.4250705,6.09625468 Z" id="Path"></path>
                                <path d="M19.9924728,6.09625468 L13.775913,6.09625468 C13.25599,6.09625468 12.8343201,5.49284746 12.8343201,4.7488405 C12.8343201,4.00483353 13.25599,3.40142631 13.775913,3.40142631 L19.9924728,3.40142631 C20.5113724,3.40142631 20.9330422,4.00483353 20.9330422,4.7488405 C20.9330422,5.49284746 20.5113724,6.09625468 19.9924728,6.09625468 Z" id="Path"></path>
                                <path d="M3.07041151,13.7309719 L3.07041151,16.1317795" id="Path"></path>
                                <path d="M21.3680172,13.7309719 L21.3680172,16.1317795" id="Path"></path>
                            </g>
                        </g>
                    </svg>
                </i>
                <div class="option-number">${house?.attributes?.beds}</div>                
                <i class="landspot-icon bathroom" aria-hidden="true">
                <svg width="22px" height="23px" viewBox="0 0 22 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Icon---Bathroom-(Small)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                        <g id="Icon---Bath-(Small)" transform="translate(1.000000, 1.000000)" stroke="#323337" stroke-width="0.75">
                            <path d="M4.02856556,19.1791294 L4.02856556,21.2679808 L4.02856556,19.1791294 Z M16.6841514,19.1791294 L16.6841514,21.2679808 L16.6841514,19.1791294 Z M14.491146,2.75618948 C14.491146,1.2335643 15.6579013,8.8817842e-15 17.0966747,8.8817842e-15 C18.5354481,8.8817842e-15 19.7010794,1.2335643 19.7010794,2.75618948 L19.7010794,9.18571218 M13.09059,3.12495026 L15.891702,3.12495026 L13.09059,3.12495026 Z M8.70414851e-14,9.10958092 L19.7010794,9.10958092 L19.7010794,15.3987366 C19.7010794,17.3745807 18.1881192,18.9757162 16.3210859,18.9757162 L3.37999348,18.9757162 C1.51296017,18.9757162 8.70414851e-14,17.3745807 8.70414851e-14,15.3987366 L8.70414851e-14,9.10958092 Z" id="Stroke-1"></path>
                        </g>
                    </g>
                </svg>
            </i>
                <div class="option-number">${house?.attributes?.bathrooms}</div>                
                <i class="landspot-icon car-park" aria-hidden="true">
                <svg width="32px" height="23px" viewBox="0 0 32 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Icon---Carpark-(small)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Group-9" transform="translate(0.000000, 8.000000)" stroke="#323337" stroke-width="0.75">
                            <path d="M3.61849278,11.8633836 L3.092379,11.8633836 C2.29491374,11.8621824 1.74036137,11.4958064 1.47374965,10.7174076 C1.15500054,9.78765356 0.846915887,8.85069209 0.596893346,7.90051706 C0.401378088,7.16175898 0.510392656,6.47585513 1.05783538,5.85481785 C2.450141,4.27279445 3.79623393,2.6487279 5.1695805,1.04988724 C5.3923494,0.790420983 5.65066652,0.558583081 5.9160933,0.342361204 C6.20521889,0.106919603 6.544112,-0.00119133537 6.92447805,9.89728231e-06 C10.175956,0.0048148279 13.427434,0.0048148279 16.678912,0.00121112994 C17.5865768,9.89728231e-06 18.2963564,0.37239202 18.82721,1.10994887 C19.6803674,2.29796796 20.5370798,3.48238336 21.3831276,4.67520739 C21.615376,5.00434513 21.9151661,5.18933496 22.3014568,5.25420152 C24.7507298,5.66262063 27.2000028,6.07103973 29.6480908,6.48786746 C30.4882139,6.62961291 31.0332867,7.43564002 30.8899089,8.29452137 C30.7595654,9.06931643 30.6339616,9.84651396 30.4988784,10.6201078 C30.3637951,11.3900979 29.7417011,11.9138354 28.9726744,11.9150366 C28.7558302,11.9150366 28.540171,11.9150366 28.3091075,11.9150366 L3.61849278,11.8633836 Z" id="Combined-Shape" stroke-linecap="round" stroke-linejoin="round"></path>
                            <ellipse id="Oval-2-Copy-3" fill="#FFFFFF" fill-rule="nonzero" cx="6.81691745" cy="11.6618193" rx="2.31045233" ry="2.28471317"></ellipse>
                            <ellipse id="Oval-2-Copy-4" fill="#FFFFFF" fill-rule="nonzero" cx="24.169071" cy="11.6618193" rx="2.31045233" ry="2.28471317"></ellipse>
                        </g>
                    </g>
                </svg>
            </i>
                <div class="option-number">${house?.attributes?.cars}</div>
                <div class="text-price">From $${new Intl.NumberFormat().format(house?.attributes?.price)}</div>
            </div>
        <div class="house-image" style="background-image: url(${house.image});">
            <div class="buttons">
                <button class="button">Facade</button>
                <button class="button">Location</button>
            </div>
        </div>
        <div class="signature">
            <div class="signature-text">
                <div class="description">
                    This design fits on<span class="lots-highlight"> ${house.estate.lots_count} Lots</span> at <span class="text-bold lots-suburubs">${house.estate.name} Estate, ${house.estate.suburb}</span>
                </div>
                <div class="price">
                    ${house.estate.lots_count ? `<span class="text-bold">Lowest Lot Price: </span><span class="text-price">$${house.estate.lots_count ? new Intl.NumberFormat().format(Math.min(...house.estate.lots.map(lot => lot.price))) : 0}*</span>` : ''}
                    <button data-id=${house.id} class="green-button" onclick='$.handleViewOptions(this)'>View Options</button>
                </div>
            </div>
            <div class="company-logo" style="background-image: url(${house.company_logo});"></div>
        </div>
    </div>`
).join('');

const BuildOptionsPagination = (pagination) => (
    `<div class='pagination-wrapper'>${pagination.per_page < pagination.total ? '<div id="pagination-container"  class="pagination"></div>' : ''}
        ${pagination.total
        ? (
            `<div class="pagination-per-page">
                 <span>Per Page</span>
                 <input type='number' min=1 max=${pagination.total} step=1 value=${pagination.per_page} oninput="return $.handlePerPageInput(this, '${pagination.total}')" onkeydown="$.handlePerPageKeyDown(this)">
             </div>`
        )
        : ''
    }`
);

const BuildOptionsLots = (house) => {
    const lots = house.estate.lots.slice(0, 4);
    return lots.length ? (
            `<div class="site-plan-cards">
                ${lots.map(lot =>
                BuildOptionsLot(lot, house)
            ).join('')}
            </div>`
        )
        : '';
};

const BuildOptionsLot = (lot, house) => (
    `<div data-id='${lot.id}' class='site-plan-card'>
        <div class="site-plan-title">
            <div class="site-plan-area">LOT ${lot.title_date} - ${lot.area}m2</div>
            <div class="site-plan-cost">$${new Intl.NumberFormat().format(lot.price)}*</div>
            <div class="site-plan-button">
                <button data-lot='${JSON.stringify(lot)}' data-house='${JSON.stringify(house)}' onclick='$.handleViewSitePlan(this)'>View Site plan</button>
            </div>
        </div>
    </div>`
);

const BuildOptionsOpenedLot = (lot, lotLowerPrice, floorplanTitle) => (
    `<div data-id='${lot.id}' data-lot-selected=${true} class="site-plan-card">
        <div class="site-plan-title">
            <div class="site-plan-area">LOT ${lot.title_date} - ${lot.area}m2</div>
            <div class="site-plan-cost">$${new Intl.NumberFormat().format(lot.price)}*</div>
            <div class="site-plan-sign">
                <div class="site-plan-sign-title"><span class="text-bold">Floorplan:</span><spanclass="text-simple"> ${floorplanTitle}</span></div>
                <div class="site-plan-sign-cost"><span class="site-plan-cost"> From ${lotLowerPrice}*</span></div>
            </div>
        </div>
        <div class="site-plan-description">
            <div class="site-plan-request">
                <div class="site-plan-request-card">
                    <div class="text-bold">Love this combo?</div>
                    <div class="site-plan-text-description">Request to get a fixed price package</div>
                    <button class="button-shared">Fix this combo</button>
                </div>
            </div>
            <div class="site-plan-drawing">
                <div class="site-plan-drawing-image" style="background-image: url(${lot.image});"></div>
            </div>
        </div>
    </div>`
);

const BuildOptionsEstateSnapshots = snapshots => snapshots.length
    ? snapshots.map(snapshot =>
        `<div class="location-conditions-card">
            <div class="location-conditions-distance">${snapshot.distance} KM</div>
            <div class="location-conditions-description">
                <div class="location-conditions-type-name">${snapshot.type_name}</div>
                <div class="location-conditions-name">${snapshot.name}</div>
            </div>
        </div>`
    ).join('')
    : '';



