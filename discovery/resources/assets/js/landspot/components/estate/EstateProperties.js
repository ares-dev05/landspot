import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import {clickHandler, LoadingSpinner, PathNavLink} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import * as actions from '../../store/estate/actions';
import {connect} from 'react-redux';
import UserAction from './consts';
import StageLots from '../../../lot-drawer/components/StageLots';

import {EstateDataContext} from '../Estate-new';

const ContactDetails = ({
    address,
    suburb,
    website,
    contacts,
    openEstateSettings,
    canEdit,
    id,
    checkFeature
}) => (
    <div className="tab">
        <dl>
            <dt>ADDRESS</dt>
            <dd>
                {address}
                <br />
                {suburb}
            </dd>
        </dl>
        <dl>
            <dt>CONTACT</dt>
            <dd>
                {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer">
                        {website}
                    </a>
                )}
                <br />
                {contacts && <a href={`tel:${contacts}`}>{contacts}</a>}
            </dd>
        </dl>
        {canEdit && (
            <dl>
                <dt>
                    <button
                        type="button"
                        className="transparent button"
                        onClick={openEstateSettings}
                    >
                        <i className="landspot-icon cog" />
                        Estate settings
                    </button>
                </dt>
                {checkFeature('lot-drawer') && (
                    <dd>
                        <a
                            className="transparent button lot-drawer"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={StageLots.componentUrl.replace(
                                ':estateId',
                                encodeURIComponent(id)
                            )}
                        >
                            <i className="landspot-icon pen" />
                            <span>Draw Lots</span>
                        </a>
                    </dd>
                )}
            </dl>
        )}
    </div>
);

const NavTabs = {
    'Contact details': ContactDetails,

    'Estate Documents': ({viewEstateDocuments, uploadEstateDocuments}) => (
        <div className="tab">
            <summary>
                <a onClick={e => clickHandler(e, viewEstateDocuments)}>
                    <i className="landspot-icon eye" />
                    View documents
                </a>
                {uploadEstateDocuments && (
                    <a onClick={e => clickHandler(e, uploadEstateDocuments)}>
                        <i className="landspot-icon upload" />
                        Upload a new document
                    </a>
                )}
            </summary>
        </div>
    ),

    'PDF Pricelist': ({openPDFEditor, showExportLotsDialog, exportPDFUrl}) => (
        <div className="tab">
            <summary>
                {openPDFEditor && (
                    <a onClick={e => clickHandler(e, openPDFEditor)}>
                        <i className="landspot-icon pen" />
                        Format PDF pricelist
                    </a>
                )}
                <a
                    {...(exportPDFUrl
                        ? {href: exportPDFUrl}
                        : {
                              onClick: e =>
                                  clickHandler(e, showExportLotsDialog)
                          })}
                >
                    <i className="landspot-icon export" />
                    Export PDF pricelist
                </a>
            </summary>
        </div>
    )
};

const confirmedAccurate = unixtime => {
    if (!unixtime) {
        return 'Not yet Confirmed Accurate';
    } else {
        const momentDate = moment.unix(unixtime);
        return `Confirmed Accurate at ${momentDate.format('hA on D/M/YYYY')}`;
    }
};

const lastUpdate = unixtime => {
    if (!unixtime) {
        return '';
    } else {
        const momentDate = moment.unix(unixtime);
        return `Last Updated: ${momentDate.format('Do of MMMM on h:mm a')}`;
    }
};

class EstateProperties extends React.Component {
    static propTypes = {
        queryFilters: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            activeTab: Object.keys(NavTabs)[0],
            published: null,
            approved: null,
            lotmix_public: null
        };
    }

    static getDerivedStateFromProps(props) {
        const {published, approved, lotmix_public} = props.estateData.estate;
        return {published, approved, lotmix_public};
    }
    render() {
        const {
            estateData: {isBuilder, estate, can_approve: canApprove}
        } = this.props;

        const exportPDFUrl = isBuilder
            ? `/landspot/export-stage/?estate_id=${estate.id}`
            : null;

        const {published, approved, lotmix_public, activeTab} = this.state;

        return (
            <EstateDataContext.Consumer>
                {({
                    setUserAction,
                    backToEstates,
                    checkPermission,
                    updateEstate,
                    checkFeature,
                    switchLotmixTab
                }) => {
                    const canEdit = !isBuilder && !checkPermission('read_only');
                    const hasLotmix = checkFeature('lotmix') && checkPermission('lotmix');

                    if (hasLotmix) {
                        NavTabs['Lotmix Profile'] = ContactDetails;
                    } else {
                        delete NavTabs['Lotmix Profile'];
                    }

                    const openPDFEditor = canEdit
                        ? () =>
                              setUserAction(UserAction.EDIT_LOTS_PDF_TEMPLATE, {
                                  estate
                              })
                        : null;

                    const viewEstateDocuments = () =>
                        setUserAction(UserAction.VIEW_ESTATE_PACKAGES);

                    const uploadEstateDocuments = canEdit
                        ? () => setUserAction(UserAction.EDIT_ESTATE_PACKAGES)
                        : null;

                    const showExportLotsDialog =
                        canEdit || !isBuilder
                            ? () =>
                                  setUserAction(UserAction.EXPORT_STAGE_LOTS, {
                                      estate
                                  })
                            : null;

                    return (
                        <React.Fragment>
                            <LeftPanel>
                                <a
                                    className="back-nav"
                                    href="#"
                                    onClick={e =>
                                        clickHandler(e, backToEstates)
                                    }
                                >
                                    <i className="fal fa-arrow-left" />
                                    <span>Back to all estates</span>
                                </a>
                                <div
                                    className="logo"
                                    style={{
                                        backgroundImage: estate.smallImage
                                            ? `url('${estate.smallImage}')`
                                            : null
                                    }}
                                />
                            </LeftPanel>
                            <RightPanel>
                                <div className="details">
                                    <header>{estate.name}</header>
                                    {
                                        // isBuilder &&
                                        // <div className="settings">
                                        //     {confirmedAccurate(estate['confirmed_at'])}
                                        // </div>
                                    }
                                    {canEdit && (
                                        <div className="settings">
                                            {/*{estate.isConfirmedAccurate*/}
                                            {/*? confirmedAccurate(estate['confirmed_at'])*/}
                                            {/*: <button type='button'*/}
                                            {/*className="button default"*/}
                                            {/*onClick={() => updateEstate({confirmed_at: moment().unix()})}*/}
                                            {/*>*/}
                                            {/*Confirmed Accurate*/}
                                            {/*</button>*/}
                                            {/*}*/}
                                            <span className="status">
                                                STATUS
                                            </span>
                                            <NiceDropdown
                                                defaultItem={null}
                                                items={[
                                                    {
                                                        text: 'Published',
                                                        value: 1
                                                    },
                                                    {
                                                        text: 'Unpublished',
                                                        value: 0
                                                    }
                                                ]}
                                                itemClass={
                                                    published
                                                        ? 'published'
                                                        : 'unpublished'
                                                }
                                                value={published}
                                                onChange={published =>
                                                    updateEstate({published})
                                                }
                                            />
                                            {canApprove && (
                                                <NiceDropdown
                                                    defaultItem={null}
                                                    items={[
                                                        {
                                                            text: 'Approved',
                                                            value: 1
                                                        },
                                                        {
                                                            text: 'Unapproved',
                                                            value: 0
                                                        }
                                                    ]}
                                                    itemClass={
                                                        approved
                                                            ? 'published'
                                                            : 'unpublished'
                                                    }
                                                    value={approved}
                                                    onChange={approved =>
                                                        updateEstate({approved})
                                                    }
                                                />
                                            )}

                                            {canApprove && (
                                                <NiceDropdown
                                                    defaultItem={null}
                                                    items={[
                                                        {
                                                            text: 'Lotmix Public',
                                                            value: 1
                                                        },
                                                        {
                                                            text: 'Lotmix Hidden',
                                                            value: 0
                                                        }
                                                    ]}
                                                    itemClass={
                                                        lotmix_public
                                                            ? 'published'
                                                            : 'unpublished'
                                                    }
                                                    value={lotmix_public}
                                                    onChange={lotmix_public =>
                                                        updateEstate({lotmix_public})
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="attributes">
                                    <nav role="navigation">
                                        {Object.keys(NavTabs).map(item => (
                                            <NavTab
                                                key={item}
                                                title={item}
                                                activeTab={activeTab}
                                                setActiveTab={activeTab => {
                                                    this.setState({
                                                        activeTab
                                                    });
                                                    hasLotmix &&
                                                        switchLotmixTab(
                                                            activeTab ===
                                                                'Lotmix Profile'
                                                        );
                                                    //   ? setUserAction(null) : setUserAction(UserAction.EDIT_COLUMN)
                                                }}
                                            />
                                        ))}
                                    </nav>
                                    {NavTabs[activeTab]({
                                        ...estate,
                                        ...{
                                            viewEstateDocuments,
                                            uploadEstateDocuments,
                                            openPDFEditor,
                                            showExportLotsDialog,
                                            exportPDFUrl,
                                            canEdit,
                                            checkFeature,
                                            openEstateSettings: e =>
                                                clickHandler(e, () =>
                                                    setUserAction(
                                                        UserAction.EDIT_ESTATE,
                                                        {
                                                            initialEstateData: estate,
                                                            canApprove
                                                        }
                                                    )
                                                )
                                        }
                                    })}
                                </div>

                                <MessageOfTheDay
                                    estate={estate}
                                    canEdit={canEdit}
                                />

                                {canApprove && (
                                    <div className="last-update">
                                        {lastUpdate(estate['updated_at'])}
                                    </div>
                                )}
                            </RightPanel>
                        </React.Fragment>
                    );
                }}
            </EstateDataContext.Consumer>
        );
    }
}

const MessageOfTheDay = ({canEdit, estate}) => {
    return (
        <EstateDataContext.Consumer>
            {({setUserAction, userActionData, userAction, updateEstate}) => {
                const isEditAction =
                    userAction === UserAction.EDIT_ESTATE_MESSAGE;
                const {message} = estate;
                return (
                    <div className="form-rows estate-message">
                        <div className="form-row column">
                            {canEdit ? (
                                <React.Fragment>
                                    <label>
                                        Latest announcement:
                                        <div className="btn-group">
                                            {isEditAction ? (
                                                <button
                                                    className="button transparent"
                                                    onClick={() => {
                                                        const {
                                                            message
                                                        } = userActionData;
                                                        updateEstate({message});
                                                        setUserAction(null);
                                                    }}
                                                >
                                                    <i className="fal fa-save" />
                                                </button>
                                            ) : (
                                                <button
                                                    className="button transparent"
                                                    onClick={() =>
                                                        setUserAction(
                                                            UserAction.EDIT_ESTATE_MESSAGE,
                                                            {message}
                                                        )
                                                    }
                                                >
                                                    <i className="landspot-icon pen" />
                                                </button>
                                            )}
                                        </div>
                                    </label>
                                    {isEditAction ? (
                                        <div className="landspot-input">
                                            <textarea
                                                className=""
                                                placeholder="Latest announcement"
                                                onChange={e =>
                                                    setUserAction(
                                                        UserAction.EDIT_ESTATE_MESSAGE,
                                                        {
                                                            message:
                                                                e.target.value
                                                        }
                                                    )
                                                }
                                                defaultValue={message}
                                            />
                                        </div>
                                    ) : (
                                        <pre>{message || 'No message'}</pre>
                                    )}
                                </React.Fragment>
                            ) : message ? (
                                <React.Fragment>
                                    <label>Latest announcement: </label>
                                    <pre>{message || 'No message'}</pre>
                                </React.Fragment>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                );
            }}
        </EstateDataContext.Consumer>
    );
};

const NavTab = ({title, activeTab, setActiveTab}) => (
    <a
        href="#"
        onClick={e => clickHandler(e, () => setActiveTab(title))}
        className={activeTab === title ? 'active' : null}
    >
        {title}
    </a>
);

export default withRouter(
    connect(
        state => ({estateData: state.estate}),
        actions
    )(EstateProperties)
);
