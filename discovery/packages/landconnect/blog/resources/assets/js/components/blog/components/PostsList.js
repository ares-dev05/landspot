import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {LoadingSpinner, ThumbItem} from '~blog~/helpers';
import * as actions from '../store/posts/actions';
import _ from 'lodash';
import Navigation from "./Navigation";
import queryString from 'query-string';
import {NavLink} from "react-router-dom";


class PostsList extends React.Component {
    static componentUrl = '/insights';

    static propTypes = {
        getPosts: PropTypes.func.isRequired,
        resetPostsStore: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            locationKey: props.location.key,
            activeTopic: '',
            preloader: true
        };
    }

    getDataFromQuery = (props) => {
        const query = queryString.parse(props.location.search);
        const {topic} = query;

        return topic || '';
    };

    componentWillMount() {
        const topic = this.getDataFromQuery(this.props);

        this.props.getPosts({topic});
        this.setState({activeTopic: topic});
    }

    componentDidUpdate(prevProps, prevState) {
        const topic = this.getDataFromQuery(this.props);
        const prevTopic = this.getDataFromQuery(prevProps);
        const preloader = this.state.preloader;

        if (topic !== prevTopic) {
            this.props.getPosts({topic});
            this.setState({activeTopic: topic});
        }

        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false})
        }
    }

    componentWillUnmount() {
        this.props.resetPostsStore();
    }

    render() {
        const posts = _.get(this.props.posts, 'data', []);
        const postsTotal = _.get(this.props.posts, 'total', 0);
        const {activeTopic, preloader} = this.state;
        return (
            <React.Fragment>
                <div className="container">
                    <header>Insights</header>
                    <Navigation activeTopic={activeTopic}/>
                </div>
                <div className='posts'>
                    {preloader
                        ? <LoadingSpinner/>
                        : posts.length
                            ? <div className="container">
                                <div className="posts-list">
                                    {posts.map(post => <PostItem key={post.id} post={post}/>)}

                                    {(postsTotal > 7 && posts.length < postsTotal) &&
                                    <React.Fragment>
                                        <div className="blur"/>
                                        <button type={'button'} className="load-more">
                                            MORE POSTS
                                        </button>
                                    </React.Fragment>
                                    }
                                </div>
                            </div>
                            : <div className="text-center">There are no posts</div>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export const PostItem = ({post}) => {
    const smallImage = _.get(post.thumb, 'media.smallImage', '');
    return <div className="post">
        {smallImage &&
        <ThumbItem onClick={() => console.log('PostItem')}
                   isFloat={false}
                   bgSize='cover'
                   bgImage={`url('${smallImage}')`}
        />
        }

        <div className="description">
            <span className="category">{_.get(post, 'topic.title', '')}</span>

            <span className="title">{post.title}</span>
            <span className="desc">{post.description}</span>
            <span className="read-more">
                <NavLink exact
                         to={`${PostsList.componentUrl}/${post.slug}`}>
                    Read more
                </NavLink>
            </span>
        </div>
    </div>
};

export default connect(
    (state => ({
        posts: state.blogPosts.posts
    })), actions
)(PostsList);
