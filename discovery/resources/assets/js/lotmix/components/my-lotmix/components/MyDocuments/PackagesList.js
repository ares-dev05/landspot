import React from 'react';
import {Cards} from '~/helpers/CardImageItem';
import CardImageItem from '~/helpers/CardImageItem';
import PropTypes from 'prop-types';

const PackagesList = ({documents}) => (
    <Cards>
        {documents.map(({id, thumbImage, fileURL}) => (
            <CardImageItem
                key={id}
                href={`/my-document/${id}`}
                toBlank={true}
                className="a4"
                bgImage={`url('${thumbImage || fileURL}')`}
                bgSize="contain"
                customContent={
                    <div className="eye-overlay">
                        <div>
                            <i className="landspot-icon eye"/>
                            View package
                        </div>
                    </div>
                }
            />
        ))}
    </Cards>
);

PackagesList.propTypes = {
    documents: PropTypes.array.isRequired
};


export default PackagesList;
