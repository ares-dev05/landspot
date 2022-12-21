import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from 'react-autocomplete';
import classnames from 'classnames';

/**
 * Location Item format:
 * "results": [{
        "title": "Melbourne",
        "highlightedTitle": "<b>Melbourne</b>",
        "vicinity": "Victoria",
        "highlightedVicinity": "Victoria",
        "position": [-37.81739, 144.96752],
        "category": "city-town-village",
        "categoryTitle": "City, Town or Village",
        "bbox": [144.55318, -38.22504, 145.54978, -37.5113],
        "href": "https://places.sit.ls.hereapi.com/places/v1/places/loc-dmVyc2lvbj0xO3RpdGxlPU1lbGJvdXJuZTtsYW5nPWVuO2xhdD0tMzcuODE3Mzk7bG9uPTE0NC45Njc1MjtjaXR5PU1lbGJvdXJuZTtjb3VudHJ5PUFVUztzdGF0ZT1WaWN0b3JpYTtzdGF0ZUNvZGU9VklDO2NhdGVnb3J5SWQ9Y2l0eS10b3duLXZpbGxhZ2U7c291cmNlU3lzdGVtPWludGVybmFsO3Bkc0NhdGVnb3J5SWQ9OTAwLTkxMDAtMDAwMA;context=Zmxvdy1pZD0wOWIyMTNkYS1iMTM2LTU0YWItOTY1OC0xZWFiZjJiOTRmMWJfMTY2MDY0Mjg2NTMxN18zMTU5XzYyMzUmYmJveD0xNDQuNTUzMTglMkMtMzguMjI1MDQlMkMxNDUuNTQ5NzglMkMtMzcuNTExMyZyYW5rPTA?app_id=MXtCW347CROeo0YIrbkW&app_code=oks4fF_Q5KnO_rVK-yscOw&tf=plain",
        "type": "urn:nlp-types:place",
        "resultType": "address",
        "id": "loc-dmVyc2lvbj0xO3RpdGxlPU1lbGJvdXJuZTtsYW5nPWVuO2xhdD0tMzcuODE3Mzk7bG9uPTE0NC45Njc1MjtjaXR5PU1lbGJvdXJuZTtjb3VudHJ5PUFVUztzdGF0ZT1WaWN0b3JpYTtzdGF0ZUNvZGU9VklDO2NhdGVnb3J5SWQ9Y2l0eS10b3duLXZpbGxhZ2U7c291cmNlU3lzdGVtPWludGVybmFsO3Bkc0NhdGVnb3J5SWQ9OTAwLTkxMDAtMDAwMA"
    }

 {"items":[{
    "title":"Belgrave St & 20, Hawthorn VIC 3122, Australia",
    "id":"here:cm:node:330614998",
    "resultType":"intersection",
    "address":{
        "label":"Belgrave St & 20, Hawthorn VIC 3122, Australia"
    },
    "position":{"lat":-37.82951,"lng":145.04085},
    "distance":8485,
    "mapView":{"west":145.03943,"south":-37.83063,"east":145.04227,"north":-37.82839},
    "highlights":{
    "title":[{"start":0,"end":8},{"start":14,"end":16}],
    "address":{
    "label":[{"start":0,"end":8},{"start":14,"end":16}]}}
    },
    {"title":"20 Belgrave St, Coburg VIC 3058, Australia",
    "id":"here:af:streetsection:.WjwFqufXYkDS6XpXe7ZdA:CggIBCCGnpigARABGgIyMA",
    "resultType":"houseNumber",
    "houseNumberType":"PA",
    "address":{"label":"20 Belgrave St, Coburg VIC 3058, Australia"},
    "position":{"lat":-37.74386,"lng":144.97457},
    "access":[{"lat":-37.74389,"lng":144.9749}],
    "distance":8301,
    "mapView":{"west":144.97448,"south":-37.74593,"east":144.97512,"north":-37.74229},
    "highlights":{"title":[{"start":0,"end":2},{"start":3,"end":14}],
    "address":{"label":[{"start":0,"end":2},{"start":3,"end":14}]}}},{"title":"20 Belgrave Rd, Malvern East VIC 3145, Australia","id":"here:af:streetsection:A.4REZNyb.QqcGTNgfpNUB:CggIBCCyx5mgARABGgIyMA","resultType":"houseNumber","houseNumberType":"PA","address":{"label":"20 Belgrave Rd, Malvern East VIC 3145, Australia"},"position":{"lat":-37.88252,"lng":145.06825},"access":[{"lat":-37.88247,"lng":145.06788}],"distance":13097,"mapView":{"west":145.06747,"south":-37.88457,"east":145.06853,"north":-37.87894},"highlights":{"title":[{"start":0,"end":2},{"start":3,"end":14}],"address":{"label":[{"start":0,"end":2},{"start":3,"end":14}]}}},{"title":"20 Belgrave St, Hawthorn VIC 3122, Australia","id":"here:af:streetsection:IGcB53.WpiZcP.qGjIIuXC:CggIBCCVzuSgARABGgIyMA","resultType":"houseNumber","houseNumberType":"PA","address":{"label":"20 Belgrave St, Hawthorn VIC 3122, Australia"},"position":{"lat":-37.82832,"lng":145.04075},"access":[{"lat":-37.82836,"lng":145.04104}],"distance":8452,"mapView":{"west":145.04085,"south":-37.82951,"east":145.04127,"north":-37.82708},"highlights":{"title":[{"start":0,"end":2},{"start":3,"end":14}],"address":{"label":[{"start":0,"end":2},{"start":3,"end":14}]}}},{"title":"20 Belgrove St, Preston VIC 3072, Australia","id":"here:af:streetsection:6yfNQ9EqJyQhEnWyz8RHPB:CggIBCDrlYegARABGgIyMA","resultType":"houseNumber","houseNumberType":"PA","address":{"label":"20 Belgrove St, Preston VIC 3072, Australia"},"position":{"lat":-37.74447,"lng":145.0195},"access":[{"lat":-37.74442,"lng":145.01915}],"distance":10161,"mapView":{"west":145.01868,"south":-37.74679,"east":145.01956,"north":-37.7422},"highlights":{"title":[{"start":0,"end":2},{"start":3,"end":14}],"address":{"label":[{"start":0,"end":2},{"start":3,"end":14}]}}},{"title":"20 Belgrove Ave, Balwyn VIC 3103, Australia","id":"here:af:streetsection:SBmHztmdvtFx8NUZBiUdwB:CggIBCC_1e-gARABGgIyMA","resultType":"houseNumber","houseNumberType":"PA","address":{"label":"20 Belgrove Ave, Balwyn VIC 3103, Australia"},"position":{"lat":-37.80502,"lng":145.08445},"access":[{"lat":-37.80498,"lng":145.0841}],"distance":12213,"mapView":{"west":145.08389,"south":-37.80677,"east":145.08436,"north":-37.80364},"highlights":{"title":[{"start":0,"end":2},{"start":3,"end":15}],"address":{"label":[{"start":0,"end":2},{"start":3,"end":15}]}}}],"queryTerms":[]}
 */

class SearchLocationAutocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
    }

    static propTypes = {
        items: PropTypes.array.isRequired,
        value: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        onSearchInputChange: PropTypes.func.isRequired,
        onSelect: PropTypes.func,
    };

    componentDidMount() {
        this.setState({value: this.props.value});
    }

    updateAutocomplete = (value) => {
        this.setState({value});
    };

    /* shouldItemRender: item.title.toLowerCase().indexOf(value.toLowerCase()) >= 0 */

    render = () => (
        <Autocomplete
            value={this.state.value}
            wrapperStyle={{width: '100%'}}
            wrapperProps={{className: 'autocomplete-dropdown wide'}}
            inputProps={
                {
                    id: 'search-autocomplete',
                    type: 'text',
                    placeholder: this.props.placeholder,
                    maxLength: 100
                }
            }
            items={this.props.items}

            getItemValue={item => item.id}

            shouldItemRender={(item) => item.resultType === 'houseNumber' || item.resultType === 'street' }

            onSelect={locationId => {
                const location = this.props.items.find(location => location.id === locationId);
                this.updateAutocomplete(location.title);
                if (this.props.onSelect) {
                    this.props.onSelect(location);
                }
            }}

            onChange={(event, value) => {
                this.props.onSearchInputChange(value);
                this.updateAutocomplete(value);
            }}

            renderItem={(item, isHighlighted) => (
                <div className={classnames('item', isHighlighted && 'item-highlighted')}
                     key={item.id}
                >
                    <span className='title'
                          dangerouslySetInnerHTML={{__html: item.title}} />

                    <span className='subtitle'>
                        {item.vicinity}
                    </span>
                </div>
            )}

            renderMenu={(items, value) => (
                <div className="menu">
                    {value === '' ? (
                        <div className="item">Enter an estate address</div>
                    ) : items.length === 0 ? (
                        <div className="item">No matches for <b>{value}</b></div>
                    ) : items}
                </div>
            )}
        />
    )
}

export default SearchLocationAutocomplete;