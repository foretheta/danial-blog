import React from 'react';
import _ from 'lodash';

import {Layout} from '../components/index';
import PostFeed from '../components/PostFeed';
import {getPages} from '../utils';

export default class Blog extends React.Component {
    render() {
        const displayPosts = _.orderBy(getPages(this.props.pageContext.pages, '/posts'), 'frontmatter.date', 'desc');
        return (
            <Layout {...this.props}>
              <header className="archive-header">
                <h1 className="archive-title underline">{_.get(this.props, 'pageContext.frontmatter.title')}</h1>
              </header>
              <PostFeed posts={displayPosts}
                emptyMessage="I am refreshing the public archive. Check back soon, or reach out if you are looking for a specific older post." />
            </Layout>
        );
    }
}
