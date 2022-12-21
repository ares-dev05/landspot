import React from 'react';
import classnames from 'classnames';

export const DocumentType = ({text, value, active, selectDocument, icon}) => (
    <div className={classnames([
        'document-type',
        text.toLowerCase(),
        active ? 'active' : ''
    ])}
         onClick={e => selectDocument(value)}
    >{icon()}{text.toUpperCase()}</div>
);