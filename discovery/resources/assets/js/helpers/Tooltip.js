import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Tooltip extends React.Component {
    static propTypes = {
        isHTML: PropTypes.bool,
        text: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    }

    show = () => !this.state.visible && this.setState({visible: true});
    hide = () => this.state.visible && this.setState({visible: false});

    render() {
        const {text, isHTML} = this.props;
        return (
            <span className='tooltip'
                  onMouseLeave={this.hide}
            >

                <span className='tooltip-trigger'
                      onMouseOver={this.show}
                >
                    {this.props.children}
                </span>

                {
                    this.state.visible &&
                    <div className={`tooltip-bubble tooltip-top`}>
                        {
                            isHTML ?
                                <div className='tooltip-message'
                                     dangerouslySetInnerHTML={{__html: text}}
                                />
                                : <div className='tooltip-message'>{text}</div>
                        }
                    </div>
                }
            </span>
        );
    }
}

export default Tooltip;