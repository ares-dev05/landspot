import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {LoadingSpinner} from '~/helpers';
import * as storeActions from '../../store/chat-store/actions/directory';
import {ContactUsersList} from './Directory';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';

class CompanyDirectory extends React.Component {
    static propTypes = {
        getUserContactsInObject: PropTypes.func.isRequired,
        onUserSelect: PropTypes.func.isRequired,
        company: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getUserContactsInObject({
            item_id: this.props.company.id,
            item_type: 'company'
        });
    }

    render() {
        const {company_logo, name} = this.props.company;
        const {onUserSelect} = this.props;
        const {userObjectContacts} = this.props.chatData;
        return <React.Fragment>
            <header>{name}</header>
            <Cards>
                <CardImageItem bgSize='contain'
                               bgImage={`url('${company_logo}')`}
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

export default connect((state => ({chatData: state.chatData})), storeActions)(CompanyDirectory);