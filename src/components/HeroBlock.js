import React from 'react';
import _ from 'lodash';

import {markdownify, Link, safePrefix} from '../utils';

export default class HeroBlock extends React.Component {
    render() {
        return (
            <section id={_.get(this.props, 'section.section_id')} className="hero">
              {_.get(this.props, 'section.title') ? 
              <h2 className="hero-title">{_.get(this.props, 'section.title')}</h2>
               : 
              <h2 className="hero-title">Hi, I'm {_.get(this.props, 'pageContext.site.data.author.name')}.</h2>
              }
              <div className="hero-text">
                {markdownify(_.get(this.props, 'section.content'))}
              </div>
              {_.get(this.props, 'section.actions') &&
              <p className="hero-actions">
                {_.map(_.get(this.props, 'section.actions'), (action, action_idx) => (
                <Link key={action_idx} to={safePrefix(_.get(action, 'url'))}
                  className={action_idx === 0 ? 'button' : 'button button-secondary'}>{_.get(action, 'label')}</Link>
                ))}
              </p>
              }
            </section>
        );
    }
}
