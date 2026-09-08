# Danial Ranjha

Personal site built with Gatsby.

## Production Build

The production artifact is built entirely from content committed to this repository. Netlify is configured in `netlify.toml` to run `npm run build` and publish `public`.

Use Node 18, matching `.nvmrc`. The site builds with Gatsby 5, React 18, and Dart Sass. From a clean checkout:

```sh
nvm use
npm ci
npx --no-install gatsby clean
npm run build
```

To inspect the production artifact locally, run `npm run serve` and open [http://localhost:9000/](http://localhost:9000/).

The former Stackbit content-pull and webhook build integration has been retired. No Stackbit API key or remote content materialization is required. The two Stackbit-derived compile-time plugins are repository-owned under `plugins/`: `gatsby-plugin-stackbit-static-sass` generates the site stylesheet with Dart Sass, while `gatsby-plugin-menus` supplies navigation data.

## Running Locally

Use Node 18, matching `.nvmrc`.

```sh
nvm use
npm ci
npm run develop
```

Browse to [http://localhost:8000/](http://localhost:8000/).
