import React from 'react';
import PropTypes from 'prop-types';

const MediaItem = ({id: mediaId, name, thumbImage, smallImage, removeMedia, copyURL}) => (
    <tr>
        <td>
            <a href={smallImage} target="_blank">
                <img className="media-item" src={thumbImage} alt={name} />
            </a>
        </td>
        <td>{name}</td>
        <td>
            <div className="landspot-input input-group">
                <input type="text" readOnly value={smallImage} />

                <div className="input-group-addon">
                    <button className="button transparent" onClick={(e) => copyURL(e, smallImage)}>
                        <i className="fal fa-copy"></i>
                    </button>
                </div>
            </div>
        </td>
        <td className="actions">
            <a href={smallImage} title="Show" className="button transparent" target="_blank">
                <i className="fal fa-eye" aria-hidden="true"></i>
            </a>

            <a href={`/landspot/notifications/media-file/${mediaId}`} title="Download" className="button transparent">
                <i className="fal fa-download" aria-hidden="true"></i>
            </a>

            <button className="button transparent" type="button" onClick={() => removeMedia(true, {mediaId})}>
                <i className="landspot-icon trash" aria-hidden="true"></i>
            </button>
        </td>
    </tr>
);

MediaItem.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    thumbImage: PropTypes.string.isRequired,
    smallImage: PropTypes.string.isRequired,
    removeMedia: PropTypes.func.isRequired,
    copyURL: PropTypes.func.isRequired,
};

export default MediaItem;