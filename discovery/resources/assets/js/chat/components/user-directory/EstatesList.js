import React from 'react';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';

class EstatesList extends React.Component {
    render() {
        const {estates, onEstateSelect} = this.props;
        return estates.length
            ?
            <React.Fragment>
                <header>Estates</header>
                <Cards>
                    {
                        estates.map(estate =>
                            <CardImageItem key={estate.id}
                                           bgSize='cover'
                                           bgImage={`url('${estate['thumbImage']}')`}
                                           onClick={() => onEstateSelect(estate)}
                                           title={estate.name}
                            />
                        )
                    }

                </Cards>
            </React.Fragment>
            : null;
    }
}

export default EstatesList;