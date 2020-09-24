#!/usr/bin/env bash
set -euxo pipefail
shopt -s inherit_errexit

# This requires setting up creds to push back to github
# npm version patch
# git push && git push --tags

# This is the lazy approach
npm version "0.0.1-$(node -p "(new Date).toISOString().replace(/:/g, '-')")"

vcse package
vcse publish
