import React, {useState} from 'react';
import PropTypes from 'prop-types';
import AmenitySnapshotForm from './AmenitySnapshotForm';

const initSnapshots = [
    {
        name: '',
        distance: 0,
        type_name: 'Closest School'
    },
    {
        name: '',
        distance: 0,
        type_name: 'Closest Shopping Centre'
    },
    {
        name: '',
        distance: 0,
        type_name: 'Time to CBD'
    }
];

const AmenitySnapshot = ({
                             iconColor,
                             showForm,
                             updateSnapshots,
                             estate: {estate_snapshots = [], suburb = '', id = 0}
                         }) => {
    const [snapshotsState, setSnapshotsState] = useState(estate_snapshots.length ? estate_snapshots : initSnapshots);

    return (
        <React.Fragment>
            {!showForm && !!estate_snapshots.length &&
            <div className="snapshot-wrapper">
                <h3 className="amenity-title">Amenity Snapshot For {suburb} Estate</h3>
                <div className="snapshot-section">
                    {estate_snapshots.map((snapshot, i) =>
                        (
                            <div key={i} className="snapshot-card card-space">
                                <div className="snapshot-left-block">
                                    <span style={{color: iconColor}}>{snapshot.distance} KM</span>
                                </div>
                                <div className="snapshot-right-block">
                                    <div className="snapshot-title">
                                        {snapshot.type_name}
                                    </div>
                                    <div className="snapshot-description">
                                        {snapshot.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            }
            {showForm &&
            <div className="snapshot-wrapper">
                <h3 className="amenity-title">Amenity Snapshot For {suburb} Estate</h3>
                <div className="snapshot-section">
                    {snapshotsState.map((snapshot, i) =>
                        <AmenitySnapshotForm
                            key={i}
                            snapshotsState={snapshotsState}
                            snapshot={snapshot}
                            index={i}
                            iconColor={iconColor}
                            setSnapshotsState={setSnapshotsState}
                        />
                    )}
                </div>
                <button
                    className="button primary"
                    onClick={() => updateSnapshots(snapshotsState, {id})}
                >
                    Update Snapshots
                </button>
            </div>
            }
        </React.Fragment>
    );
};

AmenitySnapshot.propTypes = {
    iconColor: PropTypes.any.isRequired,
    estate: PropTypes.object.isRequired,
    showForm: PropTypes.bool.isRequired,
    updateSnapshots: PropTypes.func.isRequired
};

export default AmenitySnapshot;