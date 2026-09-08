import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';

import {Link, safePrefix} from '../utils';

export default function PostFeed({posts, emptyMessage, headingLevel = 2}) {
    const Heading = `h${headingLevel}`;
    return (
        <div className="post-feed">
          {_.isEmpty(posts) && (
          <article className="post post-empty">
            <header className="post-header">
              <Heading className="post-title">Writing archive coming back soon</Heading>
            </header>
            <div className="post-content">
              <p>{emptyMessage}</p>
            </div>
          </article>
          )}
          {_.map(posts, post => {
              const url = safePrefix(_.get(post, 'url'));
              const title = _.get(post, 'frontmatter.title');
              const date = moment(_.get(post, 'frontmatter.date'));
              const thumbnail = _.get(post, 'frontmatter.thumb_img_path');
              return (
              <article key={_.get(post, 'url')} className={`post${thumbnail ? ' has-thumbnail' : ''}`}>
                {thumbnail &&
                <Link className="post-thumbnail" to={url} tabIndex="-1" aria-hidden="true">
                  <img className="thumbnail" src={safePrefix(thumbnail)} alt="" />
                </Link>
                }
                <div className="post-summary">
                  <p className="post-meta">
                    <time className="published" dateTime={date.strftime('%Y-%m-%d')}>{date.strftime('%B %d, %Y')}</time>
                  </p>
                  <header className="post-header">
                    <Heading className="post-title"><Link to={url} rel="bookmark">{title}</Link></Heading>
                  </header>
                  <div className="post-content">
                    <p>{_.get(post, 'frontmatter.excerpt')}</p>
                  </div>
                </div>
              </article>
              );
          })}
        </div>
    );
}
