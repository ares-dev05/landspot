import React from 'react';
import {withAlert} from 'react-alert';

const urlDownloadBriefPDF = '/landspot/my-clients/brief/download/';

class BriefComponent extends React.Component {
    state = {
        lands: {
            need_land: 'need_land',
            have_land: 'have_land'
        },
        house_requirements: {
            story: [
                'Double',
                'Single'
            ]
        },
        finance: {
            preapproval: [
                'Yes',
                'No'
            ]
        }
    };

    findItem = (regions, item) => (regions.find(({id}) => (id === item)));

    render() {
        const {
            userActionData:
                {
                    first_name,
                    last_name,
                    email,
                    phone,
                    buyer_types,
                    build_regions,
                    suburb_section,
                    documents,
                    brief: {
                        id,
                        land,
                        lot_number,
                        street_name,
                        budget,
                        file_path,
                        regions,
                        estates,
                        pre_approval,
                        buyer_type_id,
                        house_requirement
                    }
                }
        } = this.props;
        const {lands, house_requirements, finance} = this.state;
        const file = file_path ? file_path.split('/')[4] : null;
        return (
            <div className="brief-details-wrapper">
                <div className="brief-row">
                    <div className="brief-title">First Name</div>
                    <div className="brief-data">
                        <div className="first-name-data">{first_name}</div>
                    </div>
                </div>
                <div className="brief-row">
                    <div className="brief-title">Land</div>
                    <div className="brief-data">
                        <div className="data-row">
                            <div className={`${lands.have_land === land ? 'active-data' : ''}`}>I have land</div>
                            <div className={`${lands.need_land === land ? 'active-data' : ''}`}>I need land</div>
                        </div>
                        <div className="data-block">
                            {lot_number && (<p><span className="brief-title">Lot number:</span> {lot_number}</p>)}
                            {street_name && (
                                <span><span className="brief-title">Street name:</span> {street_name}</span>)}
                            {(
                                lands.have_land
                                && file_path
                                && file
                            ) && (
                                <p>
                                    <a href={urlDownloadBriefPDF + id}>
                                        <i className="landspot-icon export"/>
                                        {file}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="brief-row">
                    <div className="brief-title">Build Region</div>
                    <div className="brief-data">
                        <div className="data-row">
                            {build_regions.map(({id, name}) => (<div key={id}
                                                                     className={`${this.findItem(regions, id) ? 'active-data' : ''}`}>{name}</div>))}
                        </div>
                    </div>
                </div>
                {(lands.need_land === land) ? (<div className="brief-row">
                    <div className="brief-title">Suburb Section</div>
                    <div className="brief-data">
                        <div className="data-row">
                            {estates.map(({id, suburb}) => (<div key={id}
                                                                 className={`${this.findItem(suburb_section, id) ? 'active-data' : ''}`}>{suburb}</div>))}
                        </div>
                    </div>
                </div>) : ''
                }
                <div className="brief-row">
                    <div className="brief-title">House Requirements</div>
                    <div className="brief-data">
                        <div className="data-row">
                            <div>Story:</div>
                            <div
                                className={`${house_requirement && house_requirement.double_story ? 'active-data' : ''}`}>{house_requirements['story'][0]}</div>
                            <div
                                className={`${house_requirement && house_requirement.single_story ? 'active-data' : ''}`}>{house_requirements['story'][1]}</div>
                        </div>

                        <div className="line-break"/>
                        <div className="data-row">
                            <div>Bedrooms:</div>
                            <div
                                className="active-data">{house_requirement && house_requirement.bedrooms ? house_requirement.bedrooms : '-'}</div>

                            <div>Bathrooms:</div>
                            <div
                                className="active-data">{house_requirement && house_requirement.bathrooms ? house_requirement.bathrooms : '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="brief-row">
                    <div className="brief-title">Budget</div>
                    <div className="brief-data">
                        <div className="data-row">
                            <div>Total:</div>
                            <div
                                className="active-data">{budget && budget.total_budget ? budget.total_budget : '-'}</div>
                            <div>House:</div>
                            <div
                                className="active-data">{budget && budget.house_budget ? budget.house_budget : '-'}</div>
                            <div>Land:</div>
                            <div className="active-data">{budget && budget.land_budget ? budget.land_budget : '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="brief-row">
                    <div className="brief-title">Finance</div>
                    <div className="brief-data">
                        <div className="data-row">
                            <div>Do you have preapproval?</div>
                            <div className={`${pre_approval ? 'active-data' : ''}`}>{finance['preapproval'][0]}</div>
                            <div className={`${!pre_approval ? 'active-data' : ''}`}>{finance['preapproval'][1]}</div>
                        </div>
                    </div>
                </div>

                <div className="brief-row">
                    <div className="brief-title">Buyer type</div>
                    <div className="brief-data">
                        <div className="data-row">
                            {buyer_types.map(({id, name}) => (
                                <div key={id} className={`${id === buyer_type_id ? 'active-data' : ''}`}>{name}</div>))}
                        </div>
                    </div>
                </div>

                <div className="brief-row">
                    <div className="brief-title">Contact details</div>
                    <div className="brief-data contact-details">
                        {(documents && documents.length) ? (<React.Fragment>
                            <div>{first_name}</div>
                            <div>{last_name}</div>
                            <div>{email}</div>
                            <div>{phone}</div>
                        </React.Fragment>) : (<React.Fragment>
                            <i className="far fa-lock icon-lock"/>
                            <span>Unlock Client Details by responding to this Brief</span>
                        </React.Fragment>)
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default withAlert(BriefComponent);