import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~/helpers';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import * as actions from '../../landspot/store/catalogue/actions';
import AddEstateModal from './popups/AddEstateModal';

class EstateList extends React.Component {

    static propTypes = {
        estates: PropTypes.array,
        canCreateEstates: PropTypes.bool.isRequired,
        displayMap: PropTypes.bool.isRequired,
        onEstateSelect: PropTypes.func.isRequired,
        resetFilter: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {addEstate: false}
    }

    onAddEstate = (result) => {
        this.setState({addEstate: false});

        if (result) {
            this.props.resetFilter();
        }
    };

    render() {
        const {estates, canCreateEstates, displayMap, canApprove} = this.props;
        return estates ?
            <React.Fragment>
                {
                    (estates.length > 0
                            ? <React.Fragment>
                                <Cards className={displayMap && 'hidden'}>
                                    {
                                        estates.map(
                                            estate =>
                                                <CardImageItem
                                                    key={estate.id}
                                                    className={!estate.approved && 'pending'}
                                                    bgImage={estate.small ? `url('${estate.small}')` : null}
                                                    bgSize='contain'
                                                    title={<EstateTitle {...estate}/>}
                                                    onClick={() => this.props.onEstateSelect(estate.id)}
                                                    attrList={<EstateAttribute {...estate}/>}
                                                />
                                        )
                                    }
                                </Cards>
                            </React.Fragment>
                            : <React.Fragment>
                                <p>There are no results that match your search</p>
                            </React.Fragment>
                    )
                }
                {
                    !displayMap && canCreateEstates &&
                    <button className="button primary"
                            type='button'
                            onClick={() => this.setState({addEstate: true})}>ADD ESTATE</button>
                }
                {
                    this.state.addEstate &&
                    <AddEstateModal onCancel={this.onAddEstate} canApprove={canApprove} title={'Add Estate'}/>
                }
            </React.Fragment>
            : <LoadingSpinner/>
    }
}

const EstateTitle = ({name}) => (
    <React.Fragment>
        {name}
        {
            (name === '' || name === null) &&
            <span dangerouslySetInnerHTML={{__html: '&nbsp;'}}/>
        }
    </React.Fragment>
);

const EstateAttribute = ({lots_count}) => <li>{lots_count} {lots_count === 1 ? 'Lot' : 'Lots'}</li>;

export default connect((state => ({
    canCreateEstates: state.catalogue.canCreateEstates,
    estates: state.catalogue.estates,
    houseStates: state.catalogue.house_states,
    isBuilder: state.catalogue.isBuilder,
    canApprove: state.catalogue.can_approve
})), actions)(EstateList);