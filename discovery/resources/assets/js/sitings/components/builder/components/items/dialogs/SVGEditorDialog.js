import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import {PopupModal} from '~sitings~/components/popup-dialog/PopupModal';
import * as actions from '~sitings~/components/popup-dialog/store/actions';

import SVGViewerInstance, {STEP_VIEWER, STEP_EDITOR} from '~sitings~/components/svg-viewer/components/SVGViewer';
import {LoadingSpinner} from '~sitings~/helpers';

class SVGEditorDialog extends Component {
    state = {
        preloader: false,
        step: STEP_VIEWER,
    };

    static propTypes = {
        userActionData: PropTypes.shape({
            floorplanId: PropTypes.number.isRequired,
            // permissions: PropTypes.object.isRequired,
        }).isRequired,
        popupDialogStore: PropTypes.shape({
            // history: PropTypes.array,
        }).isRequired,
        storeFloorplanSVG: PropTypes.func.isRequired,
        // updateFloorplan: PropTypes.func.isRequired,
        // resetDialogStore: PropTypes.func.isRequired,
        resetFloorplanSvgDataUpdated: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    componentWillUnmount = () => {
        this.getSVGCallback = null;
        this.props.resetDialogStore();
    };

    static getDerivedStateFromProps(props, state) {
        const newState = {};

        const {FLOORPLAN_SVG_UPDATED} = props.popupDialogStore;

        const {popupDialogStore:{errors}, alert:{error}} = props;

        if (errors && errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            props.resetMessages();
        }

        if (FLOORPLAN_SVG_UPDATED) {
            newState.preloader = false;
            props.resetFloorplanSvgDataUpdated();
            if (state.preloader) {
                props.alert.success('SVG has been successfully updated');
            }
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    setStep = () => {
        this.setState({step: this.state.step === STEP_VIEWER ? STEP_EDITOR : STEP_VIEWER});
    };

    saveSVG = () => {
        this.setState({preloader: true});
        const editorData = this.getSVGCallback();
        const data = new FormData();

        data.append('floorplanId', this.props.userActionData.floorplanId.toString());
        data.append('areaJSON', editorData.areaJSON);
        data.append('svgBlob', editorData.svgBlob, this.props.floorplan.url || 'image.svg');

        this.props.storeFloorplanSVG(data);
    };

    setCallback = fn => {
        this.getSVGCallback = fn;
    };

    render() {
        const {floorplanId} = this.props.userActionData;
        const {floorplan} = this.props;
        const {preloader, step} = this.state;
        const subtitleViewing = floorplan
            ? `${floorplan.range.name} ‒ ${floorplan.range.state.abbrev} ‒ ${floorplan.name}`
            : '...';

        return (
            <PopupModal title={step === STEP_VIEWER
                ? `Viewing ${subtitleViewing}`
                : `Area Editor: ${floorplan.company.name} - ${floorplan.range.state.abbrev} ‒ ${floorplan.name}`
            }
                        dialogClassName='svg-dialog'
                        modalBodyClass='svg-manager-container'
                        onModalHide={this.props.onCancel}
                        hideCancelButton={false}
                        customFooterButtons={
                            <button className={'button default'}
                                    onClick={this.setStep}>
                                {step === STEP_VIEWER ? 'AREA EDITOR' : 'GO TO SVG'}
                            </button>

                        }
                        okButtonTitle='SAVE SVG'
                        onOK={this.saveSVG}>

                <SVGViewerInstance step={step}
                                   onMount={this.setCallback}
                                   floorplanId={floorplanId}
                />
                {
                    preloader && <LoadingSpinner/>
                }
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialogStore: state.popupDialog,
        userProfile: state.userProfile,
        floorplan: state.svgViewerManager.floorplan,
    })), actions
)(SVGEditorDialog));