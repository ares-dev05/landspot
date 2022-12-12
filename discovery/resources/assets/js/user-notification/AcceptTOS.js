import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {clickHandler} from '~/helpers';
import store from './store';

import * as actions from './store/notification/actions';

class AcceptTOS extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true
        };
    }

    componentDidMount() {
        const container = document.createElement('div');
        container.className = 'tos-overlay';
        document.body.appendChild(container);
        this.container = container;
    }

    componentWillUnmount() {
        const {container} = this;
        container.parentNode.removeChild(container);
        store.dispatch({type: 'CLEAR_TOS'})
    }

    acceptTOS = () => {
        if (!this.state.disabled) {
            this.props.acceptTOS();
        }
    };

    componentDidUpdate() {
        const {user, tosText} = this.props;
        if (user) {
            if (tosText) {
                this.container.style.display = 'block';
            } else {
                this.props.destroy();
            }
        }
    }

    onTosTextScroll = e => {
        const element = e.target;
        this.setState({
            disabled: (element.scrollTop + element.clientHeight) / element.scrollHeight * 100 < 99
        })
    };

    render() {
        const {user, tosText} = this.props;
        return (
            user ? ReactDOM.createPortal(
                <div className='popup'>
                    <div className='tos-text'
                         dangerouslySetInnerHTML={{__html: tosText}}
                         onScroll={e => this.onTosTextScroll(e)}
                    />
                    <div className='buttons'>
                        <button type='button'
                                className='button primary'
                                onClick={e => clickHandler(e, this.acceptTOS)}
                                disabled={this.state.disabled}
                        >I Agree
                        </button>
                    </div>
                </div>,
                this.container
            ) : null
        );
    }
}

const TOSPopup = connect(state => ({
    user: state.notification.user,
    tosText: state.notification.tosText
}), actions)(AcceptTOS);

class AcceptTOSWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {visible: true};
    }

    render() {
        return this.state.visible
            ? <TOSPopup destroy={() => this.setState({visible: false})}/>
            : null
    }
}

export default AcceptTOSWrapper;