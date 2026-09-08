import React from 'react';
import _ from 'lodash';

import {htmlToReact, Link} from '../utils';
import Social from './Social';

export default class Footer extends React.Component {
    render() {
        const links = _.get(this.props, 'pageContext.site.siteMetadata.footer.links');
        return (
            <footer id="colophon" className="site-footer">
              <div className="footer-content">
                <p className="site-info">{htmlToReact(_.get(this.props, 'pageContext.site.siteMetadata.footer.content'))}</p>
                {!_.isEmpty(links) &&
                <nav className="footer-navigation" aria-label="Project links">
                  <ul className="footer-links">
                    {_.map(links, (link, link_idx) => (
                    <li key={link_idx}>
                      <Link to={_.get(link, 'url')} {...(_.get(link, 'new_window') ? {target: '_blank', rel: 'noopener'} : null)}>{_.get(link, 'text')}</Link>
                    </li>
                    ))}
                  </ul>
                </nav>
                }
              </div>
              {_.get(this.props, 'pageContext.site.siteMetadata.header.has_social') && <Social {...this.props} />}
              <Link id="to-top" className="to-top" to="#page"><span className="icon-arrow-up" aria-hidden="true" /><span
                  className="screen-reader-text">Back to top</span></Link>
            </footer>
        );
    }
}
