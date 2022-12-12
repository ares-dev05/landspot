import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const PopupModalBackDrop = () => <div className='popupmodal-backdrop'/>;
const PopupModalTitle = ({title}) => <div className='popupmodal-header'>{title}</div>;
const PopupModalBody = ({content, modalBodyClass}) => (
    <div className={classnames('popupmodal-body', modalBodyClass)}>
        {content}
    </div>
);

const PopupModalFooter = ({hideCancelButton, hideOKButton, okButtonTitle, onOK, onModalHide}) => (
    <div className='popupmodal-footer'>
        {
            !hideCancelButton &&
            <button className={'cancel'} onClick={onModalHide}>Cancel</button>
        }
        {
            !hideOKButton &&
            <button className={'default'}
                    onClick={onOK}>
                {okButtonTitle || 'OK'}
            </button>
        }
    </div>
);

class PopupModalContent extends Component {
    render() {
        return (
            <div className={classnames('kaspa-modal', this.props.dialogClassName)}>
                <PopupModalTitle {...this.props}/>
                <PopupModalBody  {...this.props}/>
                <PopupModalFooter {...this.props}
                />
            </div>
        );
    }
}

class PopupModal extends Component {
    static propTypes = {
        dialogClass: PropTypes.string,
        onOK: PropTypes.func.isRequired,
        onModalHide: PropTypes.func,
    };

    constructor(props) {
        super(props);


        this.state = {};
    }

    componentDidMount() {
        document.body.classList.add('modal-opened');
    }

    componentWillUnmount() {
        document.body.classList.remove('modal-opened');
    }

    dismissModal = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('modals-root'));
    };


    render() {
        const {onModalHide, ...props} = this.props;

        return (
            ReactDOM.createPortal(
                <React.Fragment>
                    <PopupModalBackDrop/>
                    <PopupModalContent
                        onModalHide={onModalHide || this.dismissModal}
                        {...props}/>
                </React.Fragment>,
                document.getElementById('modals-root')
            )
        );
    }
}

export {PopupModal};