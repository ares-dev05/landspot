import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import Pagination from "react-js-pagination";
import PropTypes from 'prop-types';
import MediaItem from './MediaItem';
import * as actions from '../store/Media/actions';
import {LoadingSpinner} from "~/helpers";
import store from '../store/index';
import {ConfirmDeleteDialog} from "~/popup-dialog/PopupModal";
import queryString from "query-string";

class MediaTable extends Component {
    static propTypes = {
        fetchNotificationMedia: PropTypes.func.isRequired,
        removeNotificationMedia: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false,
            showConfirmDialog: false,
            mediaId: null,
            locationKey: null,
        };
    }

    static getDerivedStateFromProps(props, state) {
        const {message, alert: {show}, location: {key: locationKey = ''}} = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (message && message !== null) {
            show(
                message,
                {
                    type: 'success',
                }
            );

            store.dispatch({type: 'RESET_MESSAGE'});

            newState.preloader = false;
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    copyURL = (e, smallImage) => {
        let Clipboard = (function(window, document, navigator) {
            let textArea, copy;

            function isOS() {
                return navigator.userAgent.match(/ipad|iphone/);
            }

            function createTextArea(text) {
                textArea = document.createElement('textArea');
                textArea.value = text;
                document.body.appendChild(textArea);
            }

            function selectText() {
                let range, selection;

                if (isOS()) {
                    range = document.createRange();
                    range.selectNodeContents(textArea);
                    selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    textArea.setSelectionRange(0, 999999);
                } else {
                    textArea.select();
                }
            }

            function copyToClipboard() {
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            copy = function(text) {
                createTextArea(text);
                selectText();
                copyToClipboard();
            };

            return {
                copy
            };
        })(window, document, navigator);

        Clipboard.copy(smallImage);

        this.props.alert.show('copied to clipboard', {type: 'info'});

        e.preventDefault();
    };

    removeMedia = (mediaId) => {
        this.props.removeNotificationMedia({...mediaId.mediaId});
        this.setState({
            preloader: true
        });
    };

    onRemove = (showConfirmDialog, mediaId) => {
        this.setState({showConfirmDialog, mediaId});
    };

    removeHandler = (remove) => {
        this.setState({
            showConfirmDialog: false
        });

        if (remove) {
            const {mediaId} = this.state;
            this.removeMedia({mediaId});
        }
    };

    filterChangeHandler = (query) => {
        const {history, location} = this.props;
        const url = `${location.pathname}?${query}`;

        history.push(url);
    };

    onPageSelect = (page) => {
        const newQuery = queryString.stringify({page});
        this.filterChangeHandler(newQuery);
    };

    componentDidUpdate(prevProps, prevState, prevContext) {
        const {locationKey} = this.state;
        const {location: {search}, fetchNotificationMedia} = this.props;

        if (prevState.locationKey !== locationKey) {
            fetchNotificationMedia(queryString.parse(search));
        }
    }

    componentDidMount () {
        const {location: {key: locationKey, search}, fetchNotificationMedia} = this.props;
        const parsed = queryString.parse(search);

        fetchNotificationMedia(parsed.page ? {page: parsed.page} : null);

        this.setState({locationKey});
    }

    render () {
        const {showConfirmDialog, mediaId} = this.state;
        const {mediaItems} = this.props;

        return (
            <React.Fragment>
                <header className="notification-header">
                    Media
                </header>

                {this.state.preloader && <LoadingSpinner className={'overlay'}/>}

                {showConfirmDialog
                    && <ConfirmDeleteDialog
                        onConfirm={this.removeHandler}
                        userActionData={{itemName: 'this media-file', mediaId}}
                        onCancel={() => {
                            this.removeHandler(false);
                        }}
                    />
                }

                {mediaItems !== null
                    ? <React.Fragment>
                        <table className="table table-media">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>URL</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mediaItems.data.length !== 0 ? mediaItems.data.map(item =>
                                    <MediaItem
                                        key={item.id}
                                        {...item}
                                        removeMedia={this.onRemove}
                                        copyURL={this.copyURL}
                                        mediaItemRef={this.mediaItemRef}
                                    />
                                ) : <tr><td colSpan={5}>There no media-files</td></tr>}
                            </tbody>
                        </table>
                        <Pagination
                            totalItemsCount={mediaItems.total}
                            activePage={mediaItems.current_page}
                            itemsCountPerPage={mediaItems.per_page}
                            hideDisabled={true}
                            onChange={this.onPageSelect}
                        />
                    </React.Fragment>
                    : <LoadingSpinner className="overlay"/>}
            </React.Fragment>
        );
    }
}

export default withAlert(connect((state) => ({
    mediaItems: state.media.mediaItems,
    message: state.media.message,
}), actions)(MediaTable));