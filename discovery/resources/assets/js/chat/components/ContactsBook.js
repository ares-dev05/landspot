import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import * as storeActions from '../store/chat-store/actions/chat';
import {DirectoryHOC, DirectoryObjectHOC} from './user-directory/Directory';
import {LoadingSpinner} from '~/helpers';

class ContactsBook extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedObject: null
        };
    }

    static propTypes = {
        companyType: PropTypes.string.isRequired,
        getContactsBook: PropTypes.func.isRequired,
        onUserSelect: PropTypes.func.isRequired,
        resetDirectory: PropTypes.func.isRequired
    };

    componentWillMount() {
        this.props.getContactsBook({});
    }

    componentWillReceiveProps(nextProps) {
        const {userContacts, userObjectContacts} = nextProps.chatData;
        if(userContacts === null && userObjectContacts === null) {
            this.setState({selectedObject: null});
            this.props.getContactsBook({});
        }
    }

    componentWillUnmount() {
        this.props.resetDirectory();
    }

    onEstateSelect = (estate) => {
        this.setState({selectedObject: {estate}});
    };

    onCompanySelect = (company) => {
        this.setState({selectedObject: {company}});
    };

    render() {
        const {companyType, userContacts, onUserSelect} = this.props;
        const {selectedObject} = this.state;

        return <div className='objects-directory'>
            {
                selectedObject
                    ? <DirectoryObjectHOC {...selectedObject}
                                          onUserSelect={onUserSelect}
                    />
                    : (
                        userContacts
                            ? <div className='scroll-wrapper'>
                                <DirectoryHOC type={companyType}
                                              userContacts={userContacts}
                                              onEstateSelect={this.onEstateSelect}
                                              onCompanySelect={this.onCompanySelect}
                                              onUserSelect={onUserSelect}
                                />
                            </div>
                            : <LoadingSpinner isStatic={true}/>
                    )

            }
        </div>;
    }
}

export default connect((state => ({chatData: state.chatData})), storeActions)(ContactsBook);