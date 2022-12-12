import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import ZoomButtons from './ZoomButtons';
import Pan from '~/helpers/Pan';
import {ResizableBox} from 'react-resizable';
import {LotDrawerContext} from '../../LotDrawerContainer';
import store from '../../store';

class PagePreview extends Component {
    static propTypes = {
        page: PropTypes.object,
    };

    static width = 300;

    constructor(props) {
        super(props);

        this.state = {
            resizeTS: 0,
            resetPage: false
        };
    }

    componentDidMount() {
        let {resizeTS} = this.state;
        const {page} = this.props;

        if (page) {
            store.dispatch({type: 'SET_PAGE_ID', payload: {pageId: page.id}});
            this.setState({
                resizeTS: ++resizeTS
            });
        }
    }

    componentDidUpdate(prevProps) {
        const {resetPage} = this.state;
        const {page, pagePreview} = this.props;
        if (page && pagePreview.pageId !== page.id) {
            store.dispatch({type: 'SET_PAGE_ID', payload: {pageId: page.id}});
            this.setZoom(0);
            this.setState({resetPage: true});
        }

        if (resetPage) {
            this.setState({resetPage: false});
        }
    }

    setZoom = (v) => {
        let {resizeTS} = this.state;
        let {pagePreview: {zoom}} = this.props;
        zoom = v === 0 ? 100 : zoom + v;

        if (zoom >= 10 && zoom <= 200) {
            store.dispatch({type: 'SET_PAGE_ZOOM', payload: {zoom}});
            this.setState({
                resizeTS: ++resizeTS
            });
        }
    };

    render() {
        const {page, pagePreview: {zoom}} = this.props;
        let {resizeTS, resetPage} = this.state;

        return (
            <LotDrawerContext.Consumer>
                {({setDrawerData}) => (
                    <ResizableBox className="page-preview"
                                  onResizeStop={(event, dimensions) => {
                                      this.setState({resizeTS: ++resizeTS});
                                      setDrawerData({resizeTS: ++resizeTS});
                                      PagePreview.width = dimensions.size.width;
                                  }}
                                  width={PagePreview.width}
                                  height={0}
                                  axis="x">
                        <div className={classnames('image', !page && 'cross')}>
                            {page &&
                            <React.Fragment>
                                <Pan resizeTS={resizeTS}
                                     resetPage={resetPage}
                                     zoom={zoom}>
                                    <img
                                        src={page.image}
                                        height={page.height * zoom / 100}
                                        width={page.width * zoom / 100}
                                        crossOrigin="anonymous"
                                        alt={page.name}/>
                                </Pan>

                                <ZoomButtons setZoom={this.setZoom}/>
                            </React.Fragment>
                            }
                        </div>
                    </ResizableBox>
                )}
            </LotDrawerContext.Consumer>
        );
    }
}

export default connect((state) => ({
    pagePreview: state.pagePreview,
}), null)(PagePreview);