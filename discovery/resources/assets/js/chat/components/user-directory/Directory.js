import React from 'react';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import UserAvatar from '../UserAvatar';
import CompanyDirectory from './CompanyDirectory';
import EstateDirectory from './EstateDirectory';

import EstatesList from './EstatesList';

const BuildersDirectory = ({userContacts, onUserSelect, onEstateSelect}) => {
    const {estates, users} = userContacts;
    return <React.Fragment>
        <EstatesList estates={estates}
                     onEstateSelect={onEstateSelect}
        />
        <ContactUsersList users={users}
                          onUserSelect={onUserSelect}
        />
    </React.Fragment>;
};

const LandDevDirectory = ({userContacts, onUserSelect, onCompanySelect}) => {
    const {companies, users} = userContacts;
    return <React.Fragment>
        <CompanyList companies={companies}
                     onCompanySelect={onCompanySelect}
        />
        {
            <ContactUsersList users={users}
                              onUserSelect={onUserSelect}/>
        }
    </React.Fragment>;
};

const ContactUsersList = ({users, onUserSelect}) => {
    return users.length
        ? <React.Fragment>
            <header className='users'>People</header>
            <div className='contact-list'>
                {
                    users.map(
                        user => <ContactUser key={user.id} {...user}
                                             onClick={() => onUserSelect(user)}/>
                    )
                }
            </div>
        </React.Fragment>
        : <div className='no-results'><i>No users found</i></div>;
};

const ContactUser = ({display_name, subtitle, avatar, onClick}) => {
    return <div className="contact-user"
                onClick={onClick}
    >
        <UserAvatar avatar={avatar}/>
        <div className="user-name">
            <div className="title">{display_name}</div>
            <div className="subtitle">{subtitle}</div>
        </div>
    </div>;
};

const CompanyList = ({companies, onCompanySelect}) => {
    return <React.Fragment>
        <header>Builders</header>
        {
            companies.length
                ? <Cards>
                    {
                        companies.map(company =>
                            <CardImageItem key={company.id}
                                           bgSize='contain'
                                           bgImage={`url('${company['company_logo']}')`}
                                           onClick={() => onCompanySelect(company)}
                                           title={company['name']}
                            />
                        )
                    }
                </Cards>
                : <div className='no-results'><i>No companies found</i></div>
        }

    </React.Fragment>;
};

const DirectoryHOC = props => {
    switch (props['type']) {
        case 'builder':
            return <BuildersDirectory {...props}/>;
        case 'developer':
            return <LandDevDirectory {...props}/>;
    }
    return null;
};

const DirectoryObjectHOC = props => {
    let type = props['company'] ? 'company' : null;
    if (!type) {
        type = props['estate'] ? 'estate' : null;
    }

    switch (type) {
        case 'company':
            return <CompanyDirectory {...props}/>;
        case 'estate':
            return <EstateDirectory {...props}/>;
    }
    return null;
};

export {BuildersDirectory, LandDevDirectory, ContactUsersList, DirectoryHOC, DirectoryObjectHOC};