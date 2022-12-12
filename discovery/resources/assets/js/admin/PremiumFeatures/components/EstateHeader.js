import React from 'react';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';

const EstateTitle = ({name}) => (
    <React.Fragment>
        {name}
        {
            (name === '' || name === null) &&
            <span dangerouslySetInnerHTML={{__html: '&nbsp;'}}/>
        }
    </React.Fragment>
);

const EstateHeader = ({name, smallImage}) => (
    <Cards>
        <CardImageItem
            bgImage={smallImage ? `url('${smallImage}')` : null}
            bgSize='contain'
            title={<EstateTitle {...{name}}/>}

        />
    </Cards>
);

export default EstateHeader;