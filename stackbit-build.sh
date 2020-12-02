#!/usr/bin/env bash

set -e
set -o pipefail
set -v

curl -s -X POST https://api.stackbit.com/project/5e63439f14b69200127309bf/webhook/build/pull > /dev/null
if [[ -z "${STACKBIT_API_KEY}" ]]; then
    echo "WARNING: No STACKBIT_API_KEY environment variable set, skipping stackbit-pull"
else
    npx @stackbit/stackbit-pull --stackbit-pull-api-url=https://api.stackbit.com/pull/5e63439f14b69200127309bf 
fi

#find /opt/build/repo/src/pages/posts/ -type f -name '*.md' -exec sed -i '/^\*\[This post/d' {} \;
find /opt/build/repo/src/pages/posts/ -type f -name '*.md' -exec sed -i 's/^\*\[This post.*/\*\[You can find me on twitter\.\]\(https\:\/\/twitter\.com\/danialranjha\)\*/gp' {} \;

curl -s -X POST https://api.stackbit.com/project/5e63439f14b69200127309bf/webhook/build/ssgbuild > /dev/null
gatsby build
curl -s -X POST https://api.stackbit.com/project/5e63439f14b69200127309bf/webhook/build/publish > /dev/null
