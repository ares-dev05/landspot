import React from 'react';
import PropTypes from 'prop-types';
import {Slider, Handles, Tracks, Rail} from 'react-compound-slider';
import {formatNumber} from '~sitings~/helpers';

const getPricesText = (ranges) => {
    return 'PRICE RANGE: $' + formatNumber(ranges[0]) + ' - $' + formatNumber(ranges[1]);
};

const Track = ({source, target, getTrackProps}) => (
    <div
        className='track'
        style={{
            left: `${source.percent}%`,
            width: `${target.percent - source.percent}%`,
        }}
        {...getTrackProps()}
    />
);

const Handle = ({handle: {id, value, percent}, domain, getHandleProps}) => (
    <React.Fragment>
        <div 
            className='left-bar'
            style={{
                width: `${percent}%`
            }} />
        <div 
            className='right-bar'
            style={{
                width: `${100 - percent}%`
            }} />
        <div
            className='handle'
            role='slider'
            aria-valuemax={0}
            aria-valuemin={0}
            aria-valuenow={value}
            style={{
                left: `${percent}%`,
            }}
            {...getHandleProps(id)}
        />
    </React.Fragment>
);

class HouseSlider extends React.Component {
    static propTypes = {
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        step: PropTypes.number.isRequired,
        onUpdate: PropTypes.func.isRequired,
        onSlideEnd: PropTypes.func,
        values: PropTypes.array.isRequired,
        formatter: PropTypes.func,
    };

    render() {
        const {min, max, values, step, onUpdate, formatter, onSlideEnd} = this.props;
        return (
            <div className='price-slider house-slider'>
                <div className="house-slider-wrap"><p>Rotation</p><p>{values}</p></div>
                <Slider
                    className='slider-container'
                    step={step}
                    mode={2}
                    domain={[min, max]}
                    onUpdate={onUpdate}
                    onSlideEnd={onSlideEnd}
                    values={values}
                >
                    <Rail>
                        {({getRailProps}) => <div className='rail' {...getRailProps()} />}
                    </Rail>
                    <Handles>
                        {({handles, getHandleProps}) => (
                            <div className='slider-handles'>
                                {
                                    handles.map((handle) => (
                                        <Handle
                                            key={handle.id}
                                            handle={handle}
                                            domain={[min, max]}
                                            getHandleProps={getHandleProps}
                                        />
                                    ))
                                }
                            </div>
                        )}
                    </Handles>
                    <Tracks left={false} right={false}>
                        {
                            ({tracks, getTrackProps}) => (
                                <div className='slider-tracks'>
                                    {tracks.map(({id, source, target}) => (
                                        <Track
                                            key={id}
                                            source={source}
                                            target={target}
                                            getTrackProps={getTrackProps}
                                        />
                                    ))}
                                </div>
                            )
                        }
                    </Tracks>
                </Slider>
            </div>
        );
    }
}

export default HouseSlider;