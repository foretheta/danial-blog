# Danial Ranjha

Personal site built with Gatsby.

## Production Build

Netlify is configured by `netlify.toml` to publish `public` and run `./stackbit-build.sh`.

`stackbit-build.sh` currently preserves the legacy Stackbit workflow:

- If `STACKBIT_API_KEY` is present, it runs `@stackbit/stackbit-pull` before the Gatsby build.
- If `STACKBIT_API_KEY` is absent, it builds only the content committed to this repo.
- If `src/pages/posts` exists, it rewrites the legacy post signature text. The directory is resolved from the current checkout instead of assuming Netlify's `/opt/build/repo` path.

The live Netlify branch, environment variables, and rollback path must be confirmed in Netlify before changing production settings.

## Running Locally

Use Node 14, matching `.nvmrc`, because this site is still on Gatsby 2 and `node-sass`.

```sh
nvm use
npm ci
npm run develop
```

Browse to [http://localhost:8000/](http://localhost:8000/).

## Reproducing Netlify Locally

To build only committed content:

```sh
nvm use
npm ci
npm run build
```

To reproduce the legacy Stackbit-assisted Netlify build:

```sh
nvm use
npm ci
export STACKBIT_API_KEY=...
./stackbit-build.sh
```
