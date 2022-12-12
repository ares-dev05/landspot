import React from 'react';
import PropTypes from 'prop-types';


const AmenitySnapshotForm = ({
                                 iconColor,
                                 snapshot: {name = '', type_name = '', distance = 0},
                                 setSnapshotsState,
                                 snapshotsState,
                                 index
                             }) => {

    const updateFieldChanged = name => e => {
        setSnapshotsState(snapshotsState.map((item, i) =>
            index === i
                ? {...item, [name]: e.target.value}
                : item
        ));
    };

    return (
        <div className="snapshot-card card-space">
            <div className="snapshot-left-block">
                <div className="landspot-input">
                    <input
                        type="number"
                        value={distance}
                        maxLength="10"
                        placeholder="distance"
                        onChange={updateFieldChanged('distance')}
                    />
                    <span style={{color: iconColor}}>KM</span>
                </div>
            </div>
            <div className="snapshot-right-block">
                <div className="snapshot-title">
                    {type_name}
                </div>
                <div className="landspot-input">
                    <input
                        type="text"
                        value={name || ''}
                        maxLength="100"
                        placeholder="name"
                        onChange={updateFieldChanged('name')}
                    />
                </div>
            </div>
        </div>
    );
};

AmenitySnapshotForm.propTypes = {
    iconColor: PropTypes.any.isRequired,
    snapshot: PropTypes.object.isRequired,
    setSnapshotsState: PropTypes.func.isRequired,
    snapshotsState: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
};


export default AmenitySnapshotForm;