import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {LoadingSpinner, PathNavLink} from '~/helpers';
import CardImageItem from '../helpers/CardImageItem';
import {Cards} from '../helpers/CardImageItem';
import NiceDropdown from '../helpers/NiceDropdown';
import {ContentPanel, LeftPanel, RightPanel} from '../helpers/Panels';
import * as actions from './store/lotPackages/actions';
import Media from 'react-media';

const defaultFilters = Object.freeze({
    stage_id: '',
    lot_id: ''
});

class LotPackages extends Component {
    static componentUrl = '/land-for-sale/view-packages/:estateId';

    static propTypes = {
        getLotPackagesForView: PropTypes.func.isRequired,
        lotPackages: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            filters: {...defaultFilters},
            locationKey: ''
        };
    }

    componentDidMount() {
        const {search, key} = this.props.location;
        const filters = LotPackages.getLocationFilters(search);
        this.setState({
            locationKey: key || '',
            filters
        });
        const {estateId} = this.props.match.params;


        this.props.getLotPackagesForView({estateId}, filters);
    }

    static getLocationFilters(search) {
        const parsed = queryString.parse(search);
        const filters = {...defaultFilters};

        Object.keys(parsed).forEach(key => {
            let v = parseInt(parsed[key]);
            if (isNaN(v)) {
                return;
            }
            filters[key] = v;
        });
        return filters;
    }

    static getDerivedStateFromProps(props, state) {
        const {estate, stage} = props.lotPackages;
        const {stage_id, lot_id} = state.filters;

        const newState = {};
        const {key: locationKey, search} = props.location;

        if (locationKey !== state.locationKey) {
            newState.locationKey = locationKey;
            newState.filters = LotPackages.getLocationFilters(search);
            return newState;
        }

        if (estate && estate.stage.length && stage_id === '') {
            newState.filters = {
                stage_id: estate.stage[0].id,
                lot_id: ''
            };
        }
        if (stage && stage.lots.length && lot_id === '' && stage.id === stage_id) {
            newState.filters = {
                stage_id: stage.id,
                lot_id: stage.lots[0].id
            };
        }
        return Object.keys(newState).length ? newState : null;
    }

    componentDidUpdate() {
        const {stage} = this.props.lotPackages;
        const {filters} = this.state;
        if (filters.stage_id && (!stage || stage.id !== filters.stage_id)) {
            const {estateId} = this.props.match.params;
            this.props.getLotPackagesForView({estateId}, {stage_id: filters.stage_id});
        }
    }

    onFilterChange = (data) => {
        const filters = {...this.state.filters, ...data};
        this.setState({filters});

        this.props.history.push(
            LotPackages.componentUrl
                       .replace(':estateId', this.props.match.params.estateId) + '?' + queryString.stringify(filters)
        );
    };

    getStages = () => this.props.lotPackages.estate.stage.map(({id, name}) => ({value: id, text: name}));
    getLots = () => this.props.lotPackages.stage.lots.map(({id, lot_number}) => ({value: id, text: '#' + lot_number}));

    render() {
        const {estate, stage} = this.props.lotPackages;
        const {filters} = this.state;
        let lot = null;
        if (stage && filters.lot_id) {
            lot = stage.lots.find(lot => lot.id === filters.lot_id);
        }

        return (
            <ContentPanel className='estate-packages'>
                {
                    estate ?
                        <React.Fragment>
                            <Media queries={{
                                medium: '(max-width: 760px)',
                                large: '(min-width: 761px)'
                            }}>
                                {
                                    matches => matches.large ?
                                        (
                                            <PathNavLink className="back-nav"
                                                         urlArgs={{estateId: estate.id}}
                                                         to={'/land-for-sale/communities/:estateId'}>
                                                <i className="fal fa-arrow-left"/>
                                                <span>Back to {estate.name}</span>
                                            </PathNavLink>
                                        )
                                        :
                                        (
                                            <div className="back-nav-wrap">
                                                <PathNavLink className="back-nav"
                                                             urlArgs={{estateId: estate.id}}
                                                             to={'/land-for-sale/communities/:estateId'}>
                                                    <i className="fal fa-arrow-left"/>
                                                    <span>Back</span>
                                                </PathNavLink>
                                                <img className="estate-image" src={estate.smallImage} alt="" />
                                            </div>
                                        )
                                }
                            </Media>
                            <header>Packages</header>
                            <div className='packages'>
                                <LeftPanel>
                                    <div className="form-rows">
                                        <div className="form-row">
                                            <label className="left-item">STAGE</label>
                                            <NiceDropdown
                                                itemClass='right-item'
                                                defaultItem={null}
                                                items={this.getStages()}
                                                onChange={stage_id => this.onFilterChange({stage_id, lot_id: ''})}
                                                value={filters.stage_id}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <label className="left-item">LOT</label>
                                            <NiceDropdown
                                                itemClass='right-item'
                                                defaultItem={null}
                                                disabled={!stage}
                                                items={stage ? this.getLots() : []}
                                                onChange={lot_id => this.onFilterChange({lot_id})}
                                                value={filters.lot_id}
                                            />
                                        </div>
                                    </div>
                                </LeftPanel>
                                <RightPanel>
                                    {
                                        stage
                                            ? <React.Fragment>
                                                {
                                                    lot &&
                                                    <Media queries={{
                                                        medium: '(max-width: 760px)',
                                                        large: '(min-width: 761px)'
                                                    }}>
                                                        {matches =>
                                                            matches.large ?
                                                                <PackagesList key={stage.id} {...lot}/> :
                                                                <Cards>
                                                                    <PackagesList key={stage.id} {...lot}/>
                                                                </Cards>
                                                        }
                                                    </Media>
                                                }
                                                {
                                                    !stage.lots.length &&
                                                    <p>No documents have been shared</p>
                                                }
                                            </React.Fragment>
                                            : <LoadingSpinner/>
                                    }
                                </RightPanel>
                            </div>

                        </React.Fragment>
                        : <LoadingSpinner/>
                }

            </ContentPanel>
        );
    }
}

const PackagesList = ({lot_package: packages}) => {
    const companies = {};
    packages.forEach(({
                          id: pkgId, thumbImage, fileURL, company: {id, name, company_small_logo}
                      }) => {
        if (!companies[id]) {
            companies[id] = {
                id, name, logo: company_small_logo, packages: []
            };
        }

        packages = companies[id].packages;
        packages.push({
            id: pkgId, thumbImage, fileURL
        });
    });

    const renderCards = (id, companies) =>
        companies[id].packages.map(
            ({id, thumbImage, fileURL}) =>
                <CardImageItem
                    key={id}
                    href={fileURL}
                    toBlank={true}
                    className='a4'
                    bgImage={`url('${thumbImage}')`}
                    bgSize='contain'
                    customContent={
                        <Media queries={{
                            medium: '(max-width: 760px)',
                            large: '(min-width: 761px)'
                        }}>
                            {
                                matches => matches.large ?
                                    <div className='eye-overlay'>
                                        <div><i className='landspot-icon eye'/>View package</div>
                                    </div> :
                                    <React.Fragment>
                                        <div className='package-enquire-wrap' onClick={(e) => {e.preventDefault()}}>
                                            <button className="button primary">Enquire</button>
                                        </div>
                                        <div className='eye-overlay'>
                                            <div><i className='landspot-icon eye'/>View package</div>
                                        </div>
                                    </React.Fragment>
                            }
                        </Media>
                    }
                />
        );

    return Object.keys(companies)
                 .map(id =>
                     <React.Fragment key={id}>
                         <Media queries={{
                             medium: '(max-width: 760px)',
                             large: '(min-width: 761px)'
                         }}>
                             {
                                 matches => matches.large ?
                                     (
                                         <React.Fragment>
                                             <header><img src={companies[id].logo}/>{companies[id].name}</header>
                                             <Cards key={id}>
                                                 {
                                                     renderCards(id, companies)
                                                 }
                                             </Cards>
                                         </React.Fragment>
                                     )
                                     :
                                     renderCards(id, companies)
                             }
                         </Media>

                     </React.Fragment>
                 );
};



const LandspotLotPackageInstance =  connect((
    state => ({lotPackages: state.lotPackages})
), actions)(LotPackages);

const LotmixLotPackageInstance =  connect((
    state => ({lotPackages: state.landspotLotPackages})
), actions)(LotPackages);

export {LotPackages, LandspotLotPackageInstance, LotmixLotPackageInstance};