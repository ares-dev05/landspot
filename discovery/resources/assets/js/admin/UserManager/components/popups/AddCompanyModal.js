import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {NiceCheckbox} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {NiceRadioGroup} from '~/helpers/NiceRadio';

const serialize = require('~/helpers/serialize');

class AddCompanyModal extends Component {
    static propTypes = {
        addCompany: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.form = null;
        this.dialog = null;

        this.state = {
            type: '',
            company: {},
            errors: [],
            open: false
        };
    }

    onCompanyTypeSelect = type => {
        this.setState({company: {type}, errors: []});
    };

    validateData = data => {
        const fields = ['name', 'builder_id', 'domain'];
        let errors = [];
        fields.forEach(field => {
            if (data[field] === undefined || data[field] === '')
                errors[field] = true;
        });

        if (Object.keys(errors).length === 0) {
            return true;
        }

        this.setState({errors});
        this.showErrors(errors);

        return false;
    };

    showErrors = errors => {
        let errorMsgs = Object.keys(errors).map(error => (
            <div key={error}>{error.replace('_', ' ')} required</div>
        ));

        this.props.alert.error(errorMsgs);
    };

    onInputChange = data => {
        // if (data.domain) {
        //     data.domain = /^(?:http(?:s)?:\/\/)?([^\/]+)/.test(data.domain.trim().toLowerCase()) ? RegExp.$1 : '';
        // }
        this.setState({
            company: Object.assign({}, this.state.company, data),
            errors: []
        });
    };

    closeModal = () => {
        this.setState({open: false});
    };

    saveCompany = () => {
        if (!this.form) return false;
        const data = serialize(this.form, {hash: true});
        switch (data.type) {
            case 'developer':
                if (!data.name) {
                    const errors = {name: true};
                    this.setState({errors});
                    this.showErrors(errors);
                    return false;
                }
                break;
            case 'builder':
                if (!this.validateData(data)) return false;
                break;

            default:
                return false;
        }
        this.props.addCompany(data);
        this.setState({open: false});
    };

    render() {
        const {open, company, errors} = this.state;
        return [
            <div key="add-company-cf" className="clearfix" />,
            <button
                key="add-company"
                className="button primary add-company"
                onClick={() => this.setState({open: true})}
            >
                ADD COMPANY
            </button>,
            <React.Fragment key="modal">
                {open && (
                    <PopupModal
                        title="Add Company"
                        ref={e => (this.dialog = e)}
                        dialogClassName={'add-company'}
                        onOK={this.saveCompany}
                        onModalHide={this.closeModal}
                    >
                        <React.Fragment>
                            <p className="annotation">Select company type</p>
                            <div className="modal-form">
                                <NiceRadioGroup
                                    value={company.type || 0}
                                    labels={{
                                        builder: 'Builder',
                                        developer: 'Developer'
                                    }}
                                    name={'company-type-radio'}
                                    onChange={value =>
                                        this.onCompanyTypeSelect(value)
                                    }
                                />

                                {company.type === 'builder' && (
                                    <form ref={e => (this.form = e)}>
                                        <input
                                            type="hidden"
                                            name="type"
                                            value="builder"
                                        />

                                        <div className="form-rows">
                                            <div className="form-row">
                                                <label className="left-item">
                                                    Company Name
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className={
                                                            errors['name']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        placeholder="Company Name"
                                                        maxLength="255"
                                                        defaultValue={
                                                            company.name
                                                        }
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                name:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="left-item">
                                                    Builder ID
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                        type="text"
                                                        name="builder_id"
                                                        className={
                                                            errors['builder_id']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        defaultValue={
                                                            company.builder_id
                                                        }
                                                        maxLength="32"
                                                        placeholder="Builder ID"
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                builder_id:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="left-item">
                                                    Domain
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                        type="text"
                                                        name="domain"
                                                        className={
                                                            errors['domain']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        defaultValue={
                                                            company.domain
                                                        }
                                                        maxLength="255"
                                                        placeholder="Domain"
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                domain:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="left-item">
                                                    Email
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                       type="email"
                                                       name="email"
                                                       className={
                                                           errors['email']
                                                               ? 'required-field right-item'
                                                               : 'right-item'
                                                       }
                                                       placeholder="Email"
                                                       maxLength="160"
                                                       onChange={e =>
                                                           this.onInputChange({
                                                               email:
                                                                    e.target
                                                                        .value
                                                           })
                                                       }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="left-item">
                                                    Website
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                        type="text"
                                                        name="website"
                                                        className={
                                                            errors['website']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        placeholder="Website"
                                                        maxLength="160"
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                website:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="left-item">
                                                    Phone
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        className={
                                                            errors['phone']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        placeholder="Phone"
                                                        maxLength="160"
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                phone:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label className="left-item">
                                                    Description
                                                </label>
                                                <div className="landspot-input">
                                                    <textarea
                                                        name="description"
                                                        rows="4"
                                                        className={
                                                            errors['description']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        placeholder="Description"
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                description:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <NiceCheckbox
                                                checkboxClass="form-row"
                                                checked={
                                                    parseInt(
                                                        company.chas_footprints
                                                    ) === 1
                                                }
                                                defaultValue={
                                                    company.chas_footprints
                                                }
                                                label="Has footprints"
                                                name="chas_footprints"
                                                onChange={() =>
                                                    this.onInputChange({
                                                        chas_footprints:
                                                            company.chas_footprints ===
                                                            1
                                                                ? 0
                                                                : 1
                                                    })
                                                }
                                            />

                                            <NiceCheckbox
                                                checkboxClass="form-row"
                                                checked={
                                                    parseInt(
                                                        company.chas_discovery
                                                    ) === 1
                                                }
                                                defaultValue={
                                                    company.chas_discovery
                                                }
                                                label="Has discovery"
                                                name="chas_discovery"
                                                onChange={() =>
                                                    this.onInputChange({
                                                        chas_discovery:
                                                            company.chas_discovery ===
                                                            1
                                                                ? 0
                                                                : 1
                                                    })
                                                }
                                            />
                                        </div>
                                    </form>
                                )}

                                {company.type === 'developer' && (
                                    <form ref={e => (this.form = e)}>
                                        <input
                                            type="hidden"
                                            name="type"
                                            value="developer"
                                        />
                                        <input
                                            type="hidden"
                                            name="builder_id"
                                            value="0"
                                        />

                                        <div className="form-rows">
                                            <div className="form-row">
                                                <label className="left-item">
                                                    Company Name
                                                </label>
                                                <div className="landspot-input">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className={
                                                            errors['name']
                                                                ? 'required-field right-item'
                                                                : 'right-item'
                                                        }
                                                        placeholder="Company Name"
                                                        maxLength="255"
                                                        defaultValue={
                                                            company.name
                                                        }
                                                        onChange={e =>
                                                            this.onInputChange({
                                                                name:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </React.Fragment>
                    </PopupModal>
                )}
            </React.Fragment>
        ];
    }
}

export default withAlert(AddCompanyModal);
