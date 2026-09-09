import React from 'react';
import _ from 'lodash';

import {Link} from '../utils';

export default class Social extends React.Component {
    render() {
        return (
            <div className="social-links">
              {_.map(_.get(this.props, 'pageContext.site.data.social.links'), (link, link_idx) => (
              link && 
              <Link key={link_idx} to={_.get(link, 'url')} target="_blank" rel="noopener"><span className="social-mark" aria-hidden="true">{_.get(link, 'mark')}</span><span className="screen-reader-text">{_.get(link, 'title')}</span></Link>
              ))}
            </div>
        );
    }
}
