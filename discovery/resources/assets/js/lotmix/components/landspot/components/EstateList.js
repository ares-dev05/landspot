import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~/helpers';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import * as actions from '../store/catalogue/actions';

class EstateList extends React.Component {

    static propTypes = {
        estates: PropTypes.array,
        displayMap: PropTypes.bool.isRequired,
        onEstateSelect: PropTypes.func.isRequired,
        resetFilter: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {estates, displayMap} = this.props;
        return estates ?
            <React.Fragment>
                {
                    (estates.length > 0
                            ? (
                                <Cards className={displayMap && 'hidden'}>
                                    {
                                        estates.map(
                                            estate =>
                                                <CardImageItem
                                                    key={estate.id}
                                                    className={!estate.approved && 'pending'}
                                                    bgImage={estate.smallImage ? `url('${estate.smallImage}')` : null}
                                                    bgSize='contain'
                                                    title={<EstateTitle {...estate}/>}
                                                    onClick={() => this.props.onEstateSelect(estate.slug)}
                                                    attrList={<EstateAttribute {...estate}/>}
                                                />
                                        )
                                    }
                                </Cards>
                            )
                            : (
                                <React.Fragment>
                                    <p>There are no results that match your search</p>
                                </React.Fragment>
                            )
                    )
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
    estates: state.landspotCatalogue.estates,
})), actions)(EstateList);