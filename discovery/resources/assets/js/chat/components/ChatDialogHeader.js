import React from 'react';
import UserAction from './UserAction';
import {LoadingSpinner} from '~/helpers';

const ChatDialogHeader = ({setUserAction, user, interlocutor, isConnecting}) => {
    return <header className="chat-dialog-header">
        {
            isConnecting && <LoadingSpinner isStatic={true}/>
        }
        Messages
        <div className='navigate-buttons'>
            <button type='button'
                    className='button transparent fal fa-address-book fa-flip-horizontal contact-button'
                    onClick={() => setUserAction(UserAction.OPEN_CONTACTS_BOOK, null, true)}
            />
            <button type='button'
                    className='button transparent fal fa-edit contact-button'
                    onClick={() => setUserAction(UserAction.COMPOSE_NEW_MESSAGE, null, true)}
            />
        </div>
    </header>;
};


export default ChatDialogHeader;