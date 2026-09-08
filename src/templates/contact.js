import React from 'react';
import _ from 'lodash';

import {Layout} from '../components/index';
import {htmlToReact, safePrefix, Link} from '../utils';

const {getContactValidationMessage} = require('../utils/contactValidation.cjs');

export default class Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {errors: {}};
        this.handleInvalid = this.handleInvalid.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    setFieldError(field) {
        const message = getContactValidationMessage(field.name, field.validity);
        this.setState(state => ({errors: {...state.errors, [field.name]: message}}));
    }

    handleInvalid(event) {
        this.setFieldError(event.currentTarget);
    }

    handleInput(event) {
        if (event.currentTarget.validity.valid && this.state.errors[event.currentTarget.name]) {
            const name = event.currentTarget.name;
            this.setState(state => ({errors: {...state.errors, [name]: ''}}));
        }
    }

    handleBlur(event) {
        if (event.currentTarget.value && !event.currentTarget.validity.valid) {
            this.setFieldError(event.currentTarget);
        }
    }

    renderFieldError(name) {
        const error = this.state.errors[name];
        return error ? <span id={`contact-${name}-error`} className="form-error" role="alert">{error}</span> : null;
    }

    render() {
        const authorEmail = _.get(this.props, 'pageContext.site.data.author.email');
        const twitter = _.find(_.get(this.props, 'pageContext.site.data.social.links'), {type: 'twitter'});
        return (
            <Layout {...this.props}>
            <article className="post page post-full contact-page">
              <header className="post-header">
                <h1 className="post-title underline">{_.get(this.props, 'pageContext.frontmatter.title')}</h1>
              </header>
              {_.get(this.props, 'pageContext.frontmatter.subtitle') &&
              <div className="post-subtitle">
                {htmlToReact(_.get(this.props, 'pageContext.frontmatter.subtitle'))}
              </div>
              }
              {_.get(this.props, 'pageContext.frontmatter.img_path') &&
              <div className="post-thumbnail">
                <img src={safePrefix(_.get(this.props, 'pageContext.frontmatter.img_path'))} alt={_.get(this.props, 'pageContext.frontmatter.title')} />
              </div>
              }
              <div className="post-content">
                {htmlToReact(_.get(this.props, 'pageContext.html'))}
                <p className="contact-options">
                  {authorEmail && <React.Fragment>Email <Link to={`mailto:${authorEmail}`}>{authorEmail}</Link></React.Fragment>}
                  {authorEmail && twitter && <span aria-hidden="true"> · </span>}
                  {twitter && <React.Fragment><Link to={_.get(twitter, 'url')} target="_blank" rel="noopener">Twitter</Link></React.Fragment>}
                </p>
                <form name="contactForm" method="POST" data-netlify-honeypot="bot-field" data-netlify="true" id="contact-form"
                  className="contact-form">
                  <p className="screen-reader-text">
                    <label>Don't fill this out if you're human: <input name="bot-field" /></label>
                  </p>
                  <p className="form-row">
                    <label className="form-label" htmlFor="contact-name">Name *</label>
                    <input id="contact-name" type="text" name="name" placeholder="Your name" className="form-input" required
                      autoComplete="name" aria-invalid={Boolean(this.state.errors.name)}
                      aria-describedby={this.state.errors.name ? 'contact-name-error' : undefined}
                      onInvalid={this.handleInvalid} onInput={this.handleInput} onBlur={this.handleBlur}/>
                    {this.renderFieldError('name')}
                  </p>
                  <p className="form-row">
                    <label className="form-label" htmlFor="contact-email">Email *</label>
                    <input id="contact-email" type="email" name="email" placeholder="Your email address" className="form-input" required
                      autoComplete="email" inputMode="email" aria-invalid={Boolean(this.state.errors.email)}
                      aria-describedby={this.state.errors.email ? 'contact-email-error' : undefined}
                      onInvalid={this.handleInvalid} onInput={this.handleInput} onBlur={this.handleBlur}/>
                    {this.renderFieldError('email')}
                  </p>
                  <p className="form-row">
                    <label className="form-label" htmlFor="contact-message">Message *</label>
                    <textarea id="contact-message" name="message" placeholder="Your message" className="form-textarea" rows="7" required
                      aria-invalid={Boolean(this.state.errors.message)}
                      aria-describedby={this.state.errors.message ? 'contact-message-error' : undefined}
                      onInvalid={this.handleInvalid} onInput={this.handleInput} onBlur={this.handleBlur} />
                    {this.renderFieldError('message')}
                  </p>
                  <input type="hidden" name="form-name" value="contactForm" />
                  <p className="form-row form-submit">
                    <button type="submit" className="button">Send Message</button>
                  </p>
                </form>
              </div>
            </article>
            </Layout>
        );
    }
}
