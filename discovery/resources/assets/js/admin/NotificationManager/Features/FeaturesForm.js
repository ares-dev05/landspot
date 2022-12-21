import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import ReactQuill, {Quill} from 'react-quill';
import {withAlert} from 'react-alert';
import ImageResize from 'quill-image-resize-module-react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as actions from '../store/Features/actions';
import {LoadingSpinner, dateFormat} from "~/helpers";
import store from "../store/index";
import {ConfirmDeleteDialog} from "~/popup-dialog/PopupModal";

Quill.register('modules/ImageResize', ImageResize);

class FeaturesForm extends Component {
    static propTypes = {
        fetchFeatureNotification: PropTypes.func.isRequired,
        createFeatureNotification: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            title: '',
            companyIds: [],
            stateIds: [],
            content: '',
            formInitialized: false,
            preloader: false,
            showConfirmDialog: false,
            errorMessages: [],
        };

        this.quillRef = null;
    }

    changeCompanies = (e) => {
        const companyIds = [];

        [...e.target.options].map(option => option.selected && companyIds.push(option.value));

        this.setState({ companyIds });
    };

    changeStates = (e) => {
        const stateIds = [];

        [...e.target.options].map(option => option.selected && stateIds.push(option.value));

        this.setState({ stateIds });
    };
    
    changeValue = (data) => {
        this.setState({
            ...data,
            errorMessages: []
        });
    };

    validate = (values) => {
        let errorMessages = [];
        const columns     = ['title', 'companyIds', 'stateIds', 'content'];

        columns.forEach((column, index) => {
            const value = values[column];

            if (!value || value.length === 0) {
                if (column === 'companyIds') {
                    errorMessages[index] = {
                        message: 'choose at least one company'
                    };
                } else if (column === 'stateIds') {
                    errorMessages[index] = {
                        message: 'choose at least one state'
                    };
                } else {
                    errorMessages[index] = {
                        message: `${column} is required`
                    };
                }
            }
        });

        if (errorMessages.length !== 0) {
            this.showErrors(errorMessages);
            this.setState({errorMessages});
            return false;
        } else {
            this.setState({errorMessages});
            return true;
        }
    };

    showErrors = (errors) => {
        let errorMsgs = errors.map((item, index) => (<div key={index}>{item.message}</div>));
        this.props.alert.error(errorMsgs);
    };

    saveNotification = (is_sent = false) => {
        const {title, companyIds, stateIds, content} = this.state;
        const {match: {params: {notificationId}}, createFeatureNotification, editFeatureNotification} = this.props;

        if (this.validate({title, companyIds, stateIds, content})) {
            this.setState({
                preloader: true
            });

            if (!notificationId) {
                createFeatureNotification({title, companyIds, stateIds, content, is_sent});
            } else {
                editFeatureNotification({title, companyIds, stateIds, content, is_sent}, {notificationId});
            }
        }
    };

    imageHandler = (data) => {
        const editor = this.quillRef.getEditor();

        if (editor && data) {
            const range = editor.getSelection();

            if (range != null) {
                let input = document.createElement('input');

                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');

                input.addEventListener('change', () => {
                    if (input.files != null) {
                        let file = input.files[0];

                        if (file != null) {
                            const formData = new FormData();

                            formData.append('image', file);

                            axios.post('/landspot/notifications/media-file', formData)
                                .then(response => {
                                    const image = response.data;

                                    if (image.id) {
                                        editor.insertEmbed(range.index, 'image', image.smallImage, image.name);
                                    }
                                });
                        }
                    }
                });

                input.click();
            }
        }
    };

    codeMirrorHandler = () => {
        const {content} = this.state;
        const editor    = this.quillRef.getEditor();
        const txtArea   = editor.container.querySelector('.ql-custom textarea');

        txtArea.value   = content;
        txtArea.style.display = txtArea.style.display === 'block' ? 'none' : 'block';

        // editor.clipboard.dangerouslyPasteHTML(content);
        editor.getModule('ImageResize').hide();
    };

    removeNotification = (notificationId) => {
        this.props.removeFeatureNotification({...notificationId.notificationId});
        this.setState({
            preloader: true
        });
    };

    onRemove = (showConfirmDialog, notificationId) => {
        this.setState({showConfirmDialog, notificationId});
    };

    removeHandler = (remove) => {
        this.setState({
            showConfirmDialog: false
        });

        if (remove) {
            const {notificationId} = this.state;

            this.removeNotification({notificationId});
            this.props.history.push('/landspot/notifications/features');
        }
    };

    componentDidMount() {
        const {match: {params: {notificationId}}, fetchFeatureNotification, fetchCompanies} = this.props;
        if (this.quillRef) {
            const editor = this.quillRef.getEditor();

            editor.clipboard.addMatcher(Node.TEXT_NODE, function(node, delta) {
                const regex = /https?:\/\/[^\s]+/g;
                if(typeof(node.data) !== 'string') return;
                const matches = node.data.match(regex);

                if(matches && matches.length > 0) {
                    let ops = [];
                    let str = node.data;

                    matches.forEach(function(match) {
                        let split = str.split(match);
                        if(match.match(/\.(png|jpg|jpeg|gif)$/)!=null){
                            const beforeLink = split.shift();
                            ops.push({ insert: beforeLink });
                            ops.push({ insert:{image: match}, attributes: { link: match }
                            });

                            str = split.join(match);
                        } else { //if link is not an image
                            const beforeLink = split.shift();
                            ops.push({ insert: beforeLink });
                            ops.push({ insert: match, attributes: { link: match }
                            });
                            str = split.join(match);
                        }
                    });
                    ops.push({ insert: str });
                    delta.ops = ops;
                }
                return delta;
            });

            const txtArea = document.createElement('textarea');

            txtArea.value       = this.state.content || '';
            txtArea.placeholder = 'Type a content...';
            txtArea.onchange    = (e) => this.changeValue({content: e.target.value});
            txtArea.className   = 'code-viewer';

            const htmlEditor    = editor.addContainer('ql-custom');
            const toolbar       = editor.getModule('toolbar');

            htmlEditor.appendChild(txtArea);
            toolbar.addHandler('image', this.imageHandler);
            toolbar.addHandler('code-block', this.codeMirrorHandler);
        }

        if (notificationId) {
            fetchFeatureNotification({notificationId});
        } else {
            fetchCompanies();
        }
    }

    componentWillUnmount() {
        this.setState({
            title: '',
            companyIds: [],
            stateIds: [],
            content: '',
            formInitialized: false,
        });

        store.dispatch({type: 'RESET_STATE'});
    }

    static getDerivedStateFromProps(props, state) {
        if (props.notification !== null) {
            const {
                notification: {
                    title,
                    sent_timestamp,
                    updated_at,
                    companies,
                    states,
                    content
                },
                featureNotificationMessage: message,
                alert: {show},
                history
            } = props;

            if (message) {
                show(
                    message,
                    {
                        type: 'success',
                    }
                );

                store.dispatch({type: 'RESET_MESSAGE'});

                history.push('/landspot/notifications/features');

                return {
                    preloader: false,
                };
            }

            if (!state.formInitialized) {
                return {
                    title,
                    content,
                    sent_timestamp,
                    updated_at,
                    companyIds: companies.map(company => company.id),
                    stateIds: states.map(state => state.id),
                    formInitialized: true,
                    preloader: false
                };
            }
        }
        
        return null;
    }

    render() {
        const {title, content, preloader, showConfirmDialog, errorMessages, companyIds, stateIds, sent_timestamp, updated_at} = this.state;
        const {match: {params: {notificationId}}, companies, states} = this.props;

        return (
            <React.Fragment>
                <header className="notification-header">
                    {!notificationId ? 'Create notifications' : 'Edit notifications'}

                    {sent_timestamp &&
                    <div className="note">
                        {`This notification has already been sent ${dateFormat(sent_timestamp)} to all selected companies.`}

                        {sent_timestamp !== updated_at &&
                        <div className="danger">
                            After the last sending the notification has been changed.
                        </div>
                        }
                    </div>
                    }
                </header>

                {showConfirmDialog && <ConfirmDeleteDialog
                        onConfirm={this.removeHandler}
                        userActionData={{itemName: 'this notification', notificationId}}
                        onCancel={() => {
                            this.removeHandler(false);
                        }}
                    />
                }

                {preloader && <LoadingSpinner className={'overlay'}/>}

                <div className="notification-form">
                    <div className="form-rows">
                        <input type="hidden" id="is-sent" name="is_sent" value="0" />

                        <div className="form-row column">
                            <label htmlFor="title">Title</label>

                            <div className="landspot-input">
                                <input
                                    placeholder="Title"
                                    value={title}
                                    maxLength="155"
                                    required
                                    name="title"
                                    type="text"
                                    id="title"
                                    onChange={(e) => this.changeValue({title: e.target.value})}
                                    className={errorMessages[0] ? 'required-field' : null}
                                />
                            </div>
                        </div>

                        <div className="form-row column">
                            <label htmlFor="companies">Companies</label>

                            <div className="landspot-input">
                                <select
                                    multiple
                                    name="companies[]"
                                    className={errorMessages[1] ? 'required-select companies' : 'companies'}
                                    value={notificationId && companyIds}
                                    onChange={(e) => this.changeCompanies(e)}
                                >
                                    {companies && companies.map(company =>
                                        <option
                                            key={company.id}
                                            value={company.id}
                                        >
                                            {company.name}
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-row column">
                            <label htmlFor="companies">States</label>

                            <div className="landspot-input">
                                <select
                                    multiple
                                    name="states[]"
                                    className={errorMessages[2] ? 'required-select states' : 'states'}
                                    value={notificationId && stateIds}
                                    onChange={(e) => this.changeStates(e)}
                                >
                                    {states && states.map(state =>
                                        <option
                                            key={state.id}
                                            value={state.id}
                                        >
                                            {`${state.name} - ${state.abbrev}`}
                                        </option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-row column">
                            <label htmlFor="content">Content</label>

                            <div className="landspot-input">
                                <ReactQuill
                                    name="content"
                                    value={content}
                                    theme="snow"
                                    placeholder="Type a content..."
                                    ref={el => this.quillRef = el}
                                    modules={{
                                        ImageResize: {
                                            modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
                                        },
                                        toolbar: [
                                            [{'size': ['small', false, 'large', 'huge']},
                                                {'font': ['sans-serif', 'serif', 'monospace']}],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{'list': 'ordered'}, {'list': 'bullet'},
                                                {'indent': '-1'}, {'indent': '+1'}, { 'align': '' },
                                                { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
                                            ['link', 'image', 'video'],
                                            ['code-block']
                                        ],
                                        keyboard: {
                                            bindings: {}
                                        },
                                        clipboard: {
                                            matchVisual: true,
                                        }
                                    }}
                                    formats={[
                                        'size', 'font', 'bold', 'italic', 'underline', 'strike', 'blockquote',
                                        'list', 'bullet', 'indent', 'align', 'link', 'image', 'video', 'code-block'
                                    ]}
                                    onChange={(content) => this.changeValue({content})}
                                    bounds={'.app'}
                                    className={errorMessages[3] ? 'required-quill' : null}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="btn-group">
                        <Link to={'/landspot/notifications/features'} className="button default">Back</Link>

                        <button type="button" className="button primary" onClick={() => this.saveNotification()}>
                            Save
                        </button>

                        <button type="button" className="button primary" onClick={() => this.saveNotification(true)}>
                            Save & Send
                        </button>

                        {notificationId
                            && <button type="button" className="button default trash"
                                       onClick={() => this.onRemove(true, {notificationId})}>
                                <i className="landspot-icon trash"></i> Delete
                            </button>
                        }
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(withAlert(connect((state) => ({
    notification: state.notifications.featureNotification,
    companies: state.notifications.companies,
    states: state.notifications.states,
    featureNotificationMessage: state.notifications.message,
}), actions)(FeaturesForm)));