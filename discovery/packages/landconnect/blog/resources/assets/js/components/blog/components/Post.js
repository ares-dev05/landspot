import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import * as actions from '../store/posts/actions';
import {withRouter} from "react-router-dom";
import _ from "lodash";
import PostsList, {PostItem} from "./PostsList";
import moment from 'moment';

import {FacebookShareButton, LinkedinShareButton} from 'react-share';
import {FacebookIcon, LinkedinIcon} from 'react-share';
import {ThumbItem, LoadingSpinner} from "~blog~/helpers";

class Post extends Component {
    static propTypes = {
        getPost: PropTypes.func.isRequired,
        resetPostStore: PropTypes.func.isRequired,
    };


    constructor(props) {
        super(props);

        this.state = {
            backParams: _.get(props.location, 'state.backParams', ''),
            preloader: true
        };
    }

    componentWillMount() {
        const {slug} = this.props.match.params;
        if (slug !== undefined) {
            this.props.getPost({slug});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {slug} = this.props.match.params;
        const {slug: prevSlug} = prevProps.match.params;
        const preloader = this.state.preloader;
        if (slug !== prevSlug) {
            this.props.getPost({slug});
            this.smoothScroller(document.getElementsByClassName('blog-content')[0])
        }

        this.checkImageParent();
        this.checkIframeParent();

        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false})
        }

        const post = this.props.post;
        const prevPost = prevProps.post;
        if (post.id && post.id !== prevPost.id) {
            document.title = `${document.title}: ${post.title}`;
        }
    }

    smoothScroller = (elem) => {
        elem && elem.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    checkImageParent = () => {
        const content = document.getElementsByClassName('content')[0];
        if (content) {
            const images = content.getElementsByTagName('img');

            for (let i = 0, image; (image = images[i++]);) {
                const parentNode = image.parentNode;
                if (parentNode.tagName === 'P' && !parentNode.classList.contains('full-width')) {
                    parentNode.classList.add('full-width');
                }
            }
        }
    };

    checkIframeParent = () => {
        const content = document.getElementsByClassName('content')[0];
        if (content) {
            const iframes = content.getElementsByTagName('iframe');

            for (let i = 0, iframe; (iframe = iframes[i++]);) {
                const parentNode = iframe.parentNode;
                if (!parentNode.classList.contains('iframe-container')) {
                    parentNode.classList.add('iframe-container');
                }
            }
        }
    };

    componentWillUnmount() {
        this.props.resetPostStore();
    }


    backToResults = (e) => {
        e.preventDefault();

        this.props.history.push(PostsList.componentUrl + this.state.backParams);
    };

    render() {
        const selectedPost = this.props.post;
        const smallImage = _.get(selectedPost.thumb, 'media.smallImage', '');
        const relatedPosts = _.get(selectedPost, 'relatedPosts', []);
        const {preloader} = this.state;

        let momentDate = moment.unix(selectedPost.created_at);
        const createdAt = momentDate.format('D MMMM YYYY');

        return (
            <React.Fragment>
                <div className="container">
                    <div className="blog-post">
                        {preloader ?
                            <LoadingSpinner isStatic={true}/>
                            : selectedPost.id
                                ? <React.Fragment>
                                    {/*{smallImage && <img src={smallImage}/>}*/}
                                    {smallImage &&
                                    <ThumbItem isFloat={false}
                                               bgSize='cover'
                                               bgImage={`url('${smallImage}')`}
                                    />
                                    }
                                    <h1 className="title">{selectedPost.title}</h1>
                                    <div className="desc">{selectedPost.description}</div>
                                    <div
                                        className="author">{selectedPost.author['display_name']} &#x2014; {createdAt}</div>

                                    <div className="content" dangerouslySetInnerHTML={{__html: selectedPost.content}}/>

                                    <div className="share-post author">
                                        <div>SHARE THIS POST</div>
                                        {/*<div className="addthis_inline_share_toolbox"/>*/}
                                        <div>
                                            <FacebookShareButton url={document.location.href}
                                                                 quote={selectedPost.title}>
                                                <FacebookIcon size={32} round={true} iconBgStyle={{fill: 'transparent'}}
                                                              logoFillColor={"#9B9B9B"}/>
                                            </FacebookShareButton>
                                            <LinkedinShareButton url={document.location.href}
                                                                 title={selectedPost.title}
                                                                 description={selectedPost.description}>
                                                <LinkedinIcon size={32} round={true} iconBgStyle={{fill: 'transparent'}}
                                                              logoFillColor={"#9B9B9B"}/>
                                            </LinkedinShareButton>
                                        </div>
                                    </div>

                                </React.Fragment>
                                : <div className="text-center">This post does not exist</div>
                        }
                    </div>
                </div>
                {relatedPosts.length
                    ? <div className='posts related-posts'>
                        <div className="container">
                            <div className='heading'>Related posts</div>
                            <div className="posts-list">
                                {relatedPosts.map(post => <PostItem key={post.id} post={post}/>)}
                            </div>
                        </div>
                    </div>
                    : ''
                }

            </React.Fragment>
        );
    }
}

export default withRouter(connect(
    (state => ({
        post: state.blogPosts.post
    })), actions
)(Post));