import React from 'react';
import PropTypes from 'prop-types';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import {getImageForMedia, HouseOptions} from '~/helpers';


const MyFloorplans = ({companies, onHouseSelect}) => (
    <div className="content">
        <div className="heading">
            My Floorplans
        </div>
        {companies.map(company => (
            <React.Fragment key={company.id}>
                <div
                    className="company-logo"
                    style={{
                        backgroundImage: `url('${company['company_logo']}')`
                    }}
                />
                <Cards>
                    {company.house.map(house => {
                        const {floorplan_short_lists, facades} = house;
                        return floorplan_short_lists.map(shortList => {
                            const facade = facades.find(facade => facade.id === shortList.facade_id);
                            return (
                                <CardImageItem
                                    key={shortList.id}
                                    bgSize="cover"
                                    bgImage={`url('${getImageForMedia(
                                        facade.mediumImage,
                                        facade.largeImage, true
                                    )}')`}
                                    onClick={() => onHouseSelect(house)}
                                    title={house.title}
                                    attrList={<HouseOptions {...house} />}
                                />
                            );
                        });
                    })}
                </Cards>
            </React.Fragment>
        ))}
    </div>
);

MyFloorplans.propTypes = {
    companies: PropTypes.array.isRequired,
    onHouseSelect: PropTypes.func.isRequired
};

export default MyFloorplans;
