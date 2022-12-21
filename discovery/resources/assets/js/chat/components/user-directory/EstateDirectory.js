import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {LoadingSpinner} from '~/helpers';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import * as storeActions from '../../store/chat-store/actions/directory';
import {ContactUsersList} from './Directory';

class EstateDirectory extends React.Component {
    static propTypes = {
        getUserContactsInObject: PropTypes.func.isRequired,
        onUserSelect: PropTypes.func.isRequired,
        estate: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getUserContactsInObject({
            item_id: this.props.estate.id,
            item_type: 'estate'
        });
    }

    render() {
        const {thumbImage, name} = this.props.estate;
        const {onUserSelect} = this.props;
        const {userObjectContacts} = this.props.chatData;
        return <React.Fragment>
            <header>{name}</header>
            <Cards>
                <CardImageItem bgImage={`url('${thumbImage}')`}
                               title={name}
                />
            </Cards>
            {
                userObjectContacts
                    ? <ContactUsersList users={userObjectContacts['users']}
                                        onUserSelect={onUserSelect}
                    />
                    : <LoadingSpinner isStatic={true}/>
            }
        </React.Fragment>;
    }
}

export default connect((state => ({chatData: state.chatData})), storeActions)(EstateDirectory);