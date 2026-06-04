#!/usr/bin/env bash

set -e
set -o pipefail

STACKBIT_PROJECT_ID="5e63439f14b69200127309bf"
STACKBIT_PULL_URL="https://api.stackbit.com/pull/${STACKBIT_PROJECT_ID}"
STACKBIT_WEBHOOK_URL="https://api.stackbit.com/project/${STACKBIT_PROJECT_ID}/webhook/build"
POSTS_DIR="${POSTS_DIR:-$(pwd)/src/pages/posts}"

curl -fsS -X POST "${STACKBIT_WEBHOOK_URL}/pull" > /dev/null || true
if [[ -z "${STACKBIT_API_KEY}" ]]; then
    echo "WARNING: No STACKBIT_API_KEY environment variable set, skipping stackbit-pull"
else
    npx @stackbit/stackbit-pull --stackbit-pull-api-url="${STACKBIT_PULL_URL}"
fi

if [[ -d "${POSTS_DIR}" ]]; then
    find "${POSTS_DIR}" -type f -name '*.md' -exec sed -i.bak 's/^\*\[This post.*/\*\[You can find me on twitter\.\]\(https\:\/\/twitter\.com\/danialranjha\)\*/' {} \;
    find "${POSTS_DIR}" -type f -name '*.bak' -delete
else
    echo "WARNING: ${POSTS_DIR} does not exist, skipping post signature rewrite"
fi

curl -fsS -X POST "${STACKBIT_WEBHOOK_URL}/ssgbuild" > /dev/null || true
npm run build
curl -fsS -X POST "${STACKBIT_WEBHOOK_URL}/publish" > /dev/null || true
