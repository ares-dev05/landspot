import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import * as storeActions from '../../store/chat-store/actions/directory';

import SearchBar from '../SearchBar';
import {DirectoryHOC, DirectoryObjectHOC} from './Directory';

class UsersDirectoryWithSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: '',
            selectedObject: null
        };
    }

    static propTypes = {
        companyType: PropTypes.string.isRequired,
        getDirectory: PropTypes.func.isRequired,
        onUserSelect: PropTypes.func.isRequired,
        resetDirectory: PropTypes.func.isRequired
    };

    componentWillMount() {
        if (this.state.searchQuery) {
            this.props.getDirectory({query: this.state.searchQuery});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.chatData.userContacts === null) {
            this.setState({
                searchQuery: '',
                selectedObject: null
            });
        }
    }

    componentWillUnmount() {
        this.props.resetDirectory();
    }

    onUserInput = (query) => {
        query = query.trim();
        this.setState({searchQuery: query});
        this.props.getDirectory({query});
    };

    onEstateSelect = (estate) => {
        this.setState({selectedObject: {estate}});
    };

    onCompanySelect = (company) => {
        this.setState({selectedObject: {company}});
    };

    render() {
        const {companyType, userContacts, onUserSelect} = this.props;
        const {selectedObject} = this.state;
        const objects = {
            builder: {
                placeholder: 'Type a estate name or user name'
            },
            developer: {
                placeholder: 'Type a company name or user name'
            }
        };

        return <div className='objects-directory'>
            {
                selectedObject
                    ? <DirectoryObjectHOC onUserSelect={onUserSelect}
                                          {...selectedObject}/>
                    : <React.Fragment>
                        <SearchBar placeholder={objects[companyType].placeholder}
                                   value={this.state.searchQuery}
                                   onUserInput={value => this.onUserInput(value)}
                        />
                        <div className='scroll-wrapper'>
                            {
                                userContacts !== null &&
                                <DirectoryHOC
                                    type={companyType}
                                    userContacts={userContacts}
                                    onEstateSelect={this.onEstateSelect}
                                    onCompanySelect={this.onCompanySelect}
                                    onUserSelect={onUserSelect}
                                />
                            }
                        </div>
                    </React.Fragment>}
        </div>;
    }
}

export default connect((state => ({chatData: state.chatData})), storeActions)(UsersDirectoryWithSearch);