import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers';
import PropTypes from 'prop-types';
import {Company} from './Company';
import {Estate} from './EstateComponent/Estate';

class ContentSection extends Component {
    static propTypes = {
        isBuilderUser: PropTypes.bool.isRequired,
        isBriefUser: PropTypes.bool.isRequired,
    };

    onCompanySelect = companyId => {
        const {
            history: {push}
        } = this.props;
        push(
            Company.componentUrl.replace(
                ':companyId',
                encodeURIComponent(companyId)
            )
        );
    };

    onEstateSelected = estateId => {
        const {
            history: {push}
        } = this.props;
        push(
            Estate.componentUrl.replace(
                ':estateId',
                encodeURIComponent(estateId)
            )
        );
    };

    render() {
        const {isBuilderUser, isBriefUser} = this.props;
        const {companies, estates} = this.props.myLotmix;

        return (isBriefUser
                ? <BriefBlock/>
                : isBuilderUser
                    ? <React.Fragment>
                        <Builders
                            companies={companies}
                            onCompanySelect={this.onCompanySelect}
                        />
                        <Estates
                            estates={estates}
                            onEstateSelected={this.onEstateSelected}
                        />
                    </React.Fragment>
                    : <React.Fragment>
                        <Estates
                            estates={estates}
                            onEstateSe lected={this.onEstateSelected}
                        />
                        <Builders
                            companies={companies}
                            onCompanySelect={this.onCompanySelect}
                        />
                    </React.Fragment>
        );
    }
}

const Builders = ({companies, onCompanySelect}) => {
    return !companies ? (
        <LoadingSpinner className="static"/>
    ) : companies.length > 0 && (
        <div className="companies-block">
            <div className="home-h1 dots-top-left">My Builders</div>
            <div className="companies">
                {companies.map(company => (
                    <div className="company"
                         key={company.id}
                         onClick={() => onCompanySelect(company.id)}>
                        <div className="company-img"
                             style={{backgroundImage: `url('${company['company_logo']}')`}}
                        />
                        <p className="company-name">{company['name']}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BriefBlock = () => (
    <div className="brief-block">
        <div className="description-block">
            <div className="description">
                <p className="home-h1">Your Enquiry Dashboard</p>
                <p className="description-text">Go view documents uploaded by your selected builders that meet your
                    requirements and get your building journey started.</p>
            </div>
            {/*<a className="lotmix-button"
               href={EnquiryProfile.componentUrl}>Go to dashboard</a>*/}
        </div>
        <div className="brief-image"/>
    </div>
);
const Estates = ({estates, onEstateSelected}) => {
    return !estates ? (
        <LoadingSpinner className="static"/>
    ) : estates.length > 0 && (
        <div className="estates-block">
            <div className="description-block">
                <div className="description">
                    <p className="home-h1 dots-top-left">My developers</p>
                    <p className="description-text">Browse available land across leading developers.</p>
                </div>
                <button className="lotmix-button">Browse Now</button>
            </div>
            <div className="estates">
                {estates.map(estate => (
                    <div
                        key={estate.id}
                        style={{backgroundImage: estate.smallImage ? `url('${estate.smallImage}')` : null}}
                        onClick={() => onEstateSelected(estate.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default withAlert(
    withRouter(
        connect(
            state => ({
                myLotmix: state.myLotmixHome
            }),
            null
        )(ContentSection)
    )
);
