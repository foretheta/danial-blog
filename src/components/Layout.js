import React from 'react';
import {Helmet} from 'react-helmet';
import _ from 'lodash';

import {safePrefix} from '../utils';
import Header from './Header';
import Footer from './Footer';

export default class Body extends React.Component {
    render() {
        const siteMetadata = _.get(this.props, 'pageContext.site.siteMetadata', {});
        const pageTitle = _.get(this.props, 'pageContext.frontmatter.title');
        const description = _.get(this.props, 'pageContext.frontmatter.excerpt') ||
            _.get(this.props, 'pageContext.frontmatter.subtitle') ||
            _.get(siteMetadata, 'description');
        const siteUrl = _.trimEnd(_.get(siteMetadata, 'site_url', ''), '/');
        const path = _.get(this.props, 'location.pathname', '/');
        const canonicalUrl = _.get(this.props, 'pageContext.frontmatter.canonical_url') ||
            (siteUrl && (siteUrl + path));
        const title = (pageTitle ? pageTitle + ' - ' : '') + _.get(siteMetadata, 'title');
        return (
            <React.Fragment>
                <Helmet>
                    <title>{title}</title>
                    <meta charSet="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="google" content="notranslate" />
                    {description && <meta name="description" content={description}/>}
                    {description && <meta property="og:description" content={description}/>}
                    <meta property="og:title" content={title}/>
                    <meta property="og:type" content={_.get(this.props, 'pageContext.frontmatter.template') === 'post' ? 'article' : 'website'}/>
                    {canonicalUrl && <meta property="og:url" content={canonicalUrl}/>}
                    <meta name="twitter:card" content="summary"/>
                    <meta name="twitter:title" content={title}/>
                    {description && <meta name="twitter:description" content={description}/>}
                    {_.get(siteMetadata, 'theme_color') && <meta name="theme-color" content={_.get(siteMetadata, 'theme_color')}/>}
                    <link rel="icon" type="image/png" sizes="32x32" href={safePrefix('favicon.png')}/>
                    <link rel="apple-touch-icon" sizes="180x180" href={safePrefix('apple-touch-icon.png')}/>
                    <link rel="stylesheet" href={safePrefix('assets/css/main.css')}/>
                    {canonicalUrl && <link rel="canonical" href={canonicalUrl}/>}
                </Helmet>
                <div id="page" className={'site style-' + _.get(this.props, 'pageContext.site.siteMetadata.layout_style') + ' palette-' + _.get(this.props, 'pageContext.site.siteMetadata.palette')}>
                  <Header {...this.props} />
                  <div id="content" className="site-content">
                    <div className="inner">
                      <main id="main" className="site-main">
                        {this.props.children}
                      </main>
                      <Footer {...this.props} />
                    </div>
                  </div>
                </div>
            </React.Fragment>
        );
    }
}
