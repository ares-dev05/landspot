import React from 'react';
import PropTypes from 'prop-types';
import {Slider, Handles, Tracks, Rail} from 'react-compound-slider';
import {formatNumber} from '~/helpers';

const getPricesText = (valueMin, valueMax) => {
    return 'PRICE RANGE: $' + formatNumber(valueMin) + ' - $' + formatNumber(valueMax);
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
    <div
        className='handle'
        role='slider'
        style={{
            left: `${percent}%`,
        }}
        {...getHandleProps(id)}
    />
);

class PriceSlider extends React.Component {
    static propTypes = {
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        step: PropTypes.number.isRequired,
        valueMin: PropTypes.number.isRequired,
        valueMax: PropTypes.number.isRequired,
        onChange: PropTypes.func.isRequired,
        hidePriceText: PropTypes.bool
    };

    static defaultProps = {
        hidePriceText: false
    };

    render() {
        const {min, max, valueMin, valueMax, step, onChange, hidePriceText} = this.props;
        return (
            <div className='price-slider'>
                <Slider
                    className='slider-container'
                    step={step}
                    mode={2}
                    domain={[min, max]}
                    onChange={onChange}
                    values={[valueMin, valueMax]}
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
                {!hidePriceText && (
                    <div className='slider-prices'>
                        {getPricesText(valueMin, valueMax)}
                    </div>
                )}
            </div>
        );
    }
}

export default PriceSlider;