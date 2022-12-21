import React, {useState} from 'react';
import PropTypes from 'prop-types';


const ReadMore = ({content, maxCharacters}) => {
    const [readMore, setReadMore] = useState(false);
    return (
        <p className="read-more">
            {
                !readMore && content.length > maxCharacters
                    ? (content.substring(0, maxCharacters) + '...')
                    : (content + ' ')
            }
            {content.length > maxCharacters && (<span
                className="read-more-link"
                onClick={() => {
                    setReadMore(!readMore);
                }}>
                Read {readMore ? 'less' : 'more'}
                <i className={`fal fa-angle-${readMore ? 'up' : 'down'}`}/>
            </span>)}
        </p>
    );
};

ReadMore.propTypes = {
    content: PropTypes.string.isRequired,
    maxCharacters: PropTypes.number
};

ReadMore.defaultProps = {
    maxCharacters: 230
};

export default ReadMore;