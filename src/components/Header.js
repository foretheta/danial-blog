import React from 'react';
import _ from 'lodash';

import {Link, safePrefix} from '../utils';
import Social from './Social';

const {getMenuFocusTarget} = require('../utils/mobileMenu.cjs');

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {menuExpanded: false};
        this.menuToggle = React.createRef();
        this.navigation = React.createRef();
        this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleDocumentKeyDown);
    }

    componentDidUpdate(previousProps, previousState) {
        document.body.classList.toggle('menu--opened', this.state.menuExpanded);
        if (!previousState.menuExpanded && this.state.menuExpanded) {
            const firstLink = this.navigation.current && this.navigation.current.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleDocumentKeyDown);
        document.body.classList.remove('menu--opened');
    }

    toggleMenu() {
        this.setState(state => ({menuExpanded: !state.menuExpanded}));
    }

    closeMenu(returnFocus = false) {
        if (!this.state.menuExpanded) return;
        this.setState({menuExpanded: false}, () => {
            if (returnFocus && this.menuToggle.current) this.menuToggle.current.focus();
        });
    }

    handleDocumentKeyDown(event) {
        if (!this.state.menuExpanded) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeMenu(true);
            return;
        }
        if (event.key !== 'Tab') return;

        const links = this.navigation.current ? Array.from(this.navigation.current.querySelectorAll('a[href]')) : [];
        const focusTarget = getMenuFocusTarget([this.menuToggle.current, ...links].filter(Boolean), document.activeElement, event.shiftKey);
        if (focusTarget) {
            event.preventDefault();
            focusTarget.focus();
        }
    }

    render() {
        const hasNavigation = _.get(this.props, 'pageContext.menus.main') && _.get(this.props, 'pageContext.site.siteMetadata.header.has_nav');
        const menuLabel = this.state.menuExpanded ? 'Close menu' : 'Open menu';
        return (
            <header id="masthead" className={'site-header ' + _.get(this.props, 'pageContext.site.siteMetadata.header.bg')}>
              <div className="site-header-wrap">
                <div className="site-header-inside">
                  <div className="site-branding">
                    {_.get(this.props, 'pageContext.site.siteMetadata.header.profile_img') &&
                    <p className="profile">
                      <Link to={safePrefix('/')}><img src={safePrefix(_.get(this.props, 'pageContext.site.siteMetadata.header.profile_img'))}
                          className="avatar" alt="Danial" /></Link>
                    </p>
                    }
                    <div className="site-identity">
                      {_.get(this.props, 'pageContext.frontmatter.template') === 'home' ?
                      <h1 className="site-title"><Link to={safePrefix('/')}>{_.get(this.props, 'pageContext.site.siteMetadata.header.title')}</Link></h1>
                       :
                      <p className="site-title"><Link to={safePrefix('/')}>{_.get(this.props, 'pageContext.site.siteMetadata.header.title')}</Link></p>
                      }
                      {_.get(this.props, 'pageContext.site.siteMetadata.header.tagline') &&
                      <p className="site-description">{_.get(this.props, 'pageContext.site.siteMetadata.header.tagline')}</p>
                      }
                    </div>
                    {hasNavigation &&
                    <button id="menu-toggle" className="menu-toggle" type="button" ref={this.menuToggle}
                      aria-controls="main-navigation" aria-expanded={this.state.menuExpanded} aria-label={menuLabel}
                      onClick={this.toggleMenu}><span className="icon-menu" aria-hidden="true" /></button>
                    }
                  </div>
                  {hasNavigation &&
                  <nav id="main-navigation" className="site-navigation" aria-label="Main navigation" ref={this.navigation}>
                    <div className="site-nav-wrap">
                      <div className="site-nav-inside">
                        <ul className="menu">
                          {_.map(_.get(this.props, 'pageContext.menus.main'), (item, item_idx) => (
                          <li key={item_idx} className={'menu-item ' + ((_.get(this.props, 'pageContext.url') === _.get(item, 'url')) ? ' current-menu-item' : '')}>
                            <Link to={safePrefix(_.get(item, 'url'))} onClick={() => this.closeMenu()}>{_.get(item, 'title')}</Link>
                          </li>
                          ))}
                        </ul>
                        {_.get(this.props, 'pageContext.site.siteMetadata.header.has_social') &&
                        <Social {...this.props} />
                        }
                      </div>
                    </div>
                  </nav>
                  }
                </div>
              </div>
            </header>
        );
    }
}
