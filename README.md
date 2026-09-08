# Danial Ranjha

Personal site built with Gatsby.

## Production Build

The production artifact is built entirely from content committed to this repository. Netlify is configured in `netlify.toml` to run `npm run build` and publish `public`.

Use Node 14, matching `.nvmrc`, because the site is still on Gatsby 2 and `node-sass`. From a clean checkout:

```sh
nvm use
npm ci
npx --no-install gatsby clean
npm run build
```

To inspect the production artifact locally, run `npm run serve` and open [http://localhost:9000/](http://localhost:9000/).

The former Stackbit content-pull and webhook build integration has been retired. No Stackbit API key or remote content materialization is required. The Stackbit-named Gatsby plugins in `gatsby-config.js` are separate compile-time dependencies and remain required: the local `gatsby-plugin-stackbit-static-sass` generates the site stylesheet, while `@stackbit/gatsby-plugin-menus` supplies navigation data.

## Running Locally

Use Node 14, matching `.nvmrc`, because this site is still on Gatsby 2 and `node-sass`.

```sh
nvm use
npm ci
npm run develop
```

Browse to [http://localhost:8000/](http://localhost:8000/).
