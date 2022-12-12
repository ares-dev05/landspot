import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~/helpers';
import * as actions from '../../store/popupDialog/actions';
import {PopupModal} from '../../../popup-dialog/PopupModal';

export const EstateDocTypes = Object.freeze({
    0: 'Plan of Subdivision',
    1: 'Engineering Report',
    2: 'Estate Guidelines (MCP)',
    3: 'Other (Image/PDF)'
});

class EstateDocumentsDialog extends React.Component {

    static propTypes = {
        estate: PropTypes.object.isRequired,
        deleteEstateDocuments: PropTypes.func.isRequired,
        getEstateDocuments: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getEstateDocuments({estateId: this.props.estate.id});
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    render() {
        const {stages} = this.props.popupDialog;
        const allStagesAreEmpty = stages && stages.every(({stage_docs}) => !stage_docs.length);
        return (
            <PopupModal title={this.props.estate.name + ' Documents'}
                        dialogClassName='estate-docs'
                        onOK={this.props.onCancel}
                        onModalHide={this.props.onCancel}
                        hideCancelButton={true}>
                {
                    stages
                        ? stages.map(stage => <StageRow key={stage.id} {...stage}/>)
                        : <LoadingSpinner isStatic={true}/>
                }
                {
                    allStagesAreEmpty && <p>No uploaded documents</p>
                }
            </PopupModal>
        );
    }
}

const StageRow = ({stage_docs, name}) => {
    return (
        stage_docs.length > 0
            ?
            <table className="table files-list">
                <thead>
                <tr>
                    <th colSpan="2">{name}</th>
                </tr>
                </thead>
                <tbody>
                {
                    stage_docs.map(({id, type, name, viewURL}) =>
                        <tr key={id}>
                            <td>
                                {EstateDocTypes[type]}
                            </td>
                            <td>
                                {
                                    <a target="_blank"
                                       rel="noopener noreferrer"
                                       className="available"
                                       href={viewURL}>
                                        {name || 'Noname.pdf'}&nbsp;<i className="fal fa-download"/>
                                    </a>
                                }
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </table>
            : null
    );
};

export default connect(
    (state => ({
        popupDialog: state.popupDialog,
        estate: state.estate.estate
    })), actions
)(EstateDocumentsDialog);