import React from 'react';
import _ from 'lodash';

import {getPages, Link, safePrefix} from '../utils';
import PostFeed from './PostFeed';

export default class PostsBlock extends React.Component {
    render() {
        const displayPosts = _.orderBy(getPages(this.props.pageContext.pages, '/posts'), 'frontmatter.date', 'desc');
        const recentPosts = displayPosts.slice(0, _.get(this.props, 'section.num_posts_displayed'));
        return (
            <section id={_.get(this.props, 'section.section_id')} className="block recent-posts">
              <h2 className="block-title underline">{_.get(this.props, 'section.title')}</h2>
              <PostFeed posts={recentPosts} headingLevel={3}
                emptyMessage="I am refreshing the public archive. Check back soon for recent writing." />
              {_.get(this.props, 'section.actions') &&
              <p className="block-cta">
                {_.map(_.get(this.props, 'section.actions'), (action, action_idx) => (
                <Link key={action_idx} to={safePrefix(_.get(action, 'url'))} className="button">{_.get(action, 'label')}</Link>
                ))}
              </p>
              }
            </section>
        );
    }
}
