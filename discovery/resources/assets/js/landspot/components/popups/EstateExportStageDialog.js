import React from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner, NiceCheckbox, getCSRFToken} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import NiceDropdown from '~/helpers/NiceDropdown';
import CheckBoxList from './CheckBoxList';

class EstateExportStageDialog extends React.Component {
    static propTypes = {
        estate: PropTypes.object.isRequired,
        popupDialog: PropTypes.shape({
            stages: PropTypes.array,
            builderCompanies: PropTypes.array,
            exportUrl: PropTypes.string,
        }).isRequired,
        onCancel: PropTypes.func.isRequired,
        getEstateDocuments: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.exportForm = null;
        this.getCheckboxState = null;
        this.state = {
            unsold: true,
            stage_id: 0,
            export_id: -1,
        };
    }

    componentDidMount() {
        const {
            estate,
            getEstateDocuments,
            alert: {error},
            onCancel
        } = this.props;

        if (estate) {
            getEstateDocuments({estateId: estate.id});
        } else {
            error('Invalid estate');
            onCancel();
        }
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    stagesList = () => {
        const {stages} = this.props.popupDialog;
        return stages.map(
            stage => ({value: stage.id, text: stage.name})
        );
    };

    builderCompaniesList = () => {
        const {builderCompanies} = this.props.popupDialog;

        let companiesList = [
            {value: -1, text: 'All lots - excluding builder exclusives/hidden'},
            {value: -2, text: 'All lots - including builder exclusives/hidden'},
            {value: 0, text: 'All lots'}
        ];

        builderCompanies.map(
            company => companiesList.push({value: company.id, text: company.name})
        );

        return companiesList;
    };

    render() {
        const {
            popupDialog: {stages, showCompanies, exportUrl},
            estate,
            onCancel
        } = this.props;
        const {unsold, stage_id, export_id} = this.state;

        return (
            <PopupModal okButtonTitle='Export'
                        dialogClassName='export-pdf-price-list'
                        title={'Export PDF Price List'}
                        onOK={() => {
                            const {selectedOptions} = this.getCheckboxState();
                            this.exportForm.elements['stage_id'].value = selectedOptions.join();
                            this.exportForm.submit();
                            onCancel();
                        }}
                        onModalHide={onCancel}>
                <React.Fragment>
                    {stages
                        ? <form action={exportUrl}
                                method="get"
                                ref={e => this.exportForm = e}>
                            <input type="hidden" name="estate_id" defaultValue={estate.id}/>
                            <input type="hidden" name="stage_id" defaultValue={stage_id}/>
                            <input type="hidden" name="export_id" defaultValue={export_id}/>
                            <input type="hidden" name="_token"
                                   defaultValue={getCSRFToken()}/>

                            <div className='label'>SELECT STAGE(S) TO EXPORT</div>

                            <CheckBoxList
                                onMount={getState => this.getCheckboxState = getState}
                                checkAllOptionsText='EXPORT ALL'
                                unCheckAllOptionsText={null}
                                allChecked={true}
                                customOptionsChecked={false}
                                allUnchecked={true}
                                options={stages}
                                selectedOptions={[]}
                                selectedOptionsLimit={Infinity}
                            />

                            {
                                showCompanies &&
                                <React.Fragment>
                                    <div className='label'>LOTS VISIBLE BY BUILDER</div>
                                    <NiceDropdown
                                        defaultItem={null}
                                        defaultValue={-1}
                                        items={this.builderCompaniesList()}
                                        onChange={export_id => this.setState({export_id})}
                                        value={export_id}
                                    />
                                </React.Fragment>
                            }
                            <NiceCheckbox
                                label='Unsold lots only'
                                name="unsold_lots"
                                defaultValue={unsold ? 'on' : ''}
                                onChange={() => {
                                    this.setState({unsold: !unsold});
                                }}
                                checked={unsold}
                            />
                        </form>

                        : <LoadingSpinner className={'overlay'}/>
                    }
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({popupDialog: state.popupDialog})), actions
)(EstateExportStageDialog));