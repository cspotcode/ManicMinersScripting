#!/usr/bin/env bash
set -euo pipefail

# This requires setting up creds to push back to github
# npm version patch
# git push && git push --tags

# This is the lazy approach
npm version "0.0.1-$(node -p "(new Date).toISOString().replace(/[-T:.]/g, '_')")"

vcse package
vcse publish
