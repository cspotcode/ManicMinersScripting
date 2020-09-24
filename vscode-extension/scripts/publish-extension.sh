#!/usr/bin/env bash
set -euxo pipefail
#shopt -s inherit_errexit

# This requires setting up creds to push back to github
npm version patch
git add package.json
version="$(node -p "require('./package').version")"
git commit -m "vscode-extension v$version"
git tag "vscode-extension-v$version"
git push && git push --tags

# This is the lazy approach (but did not work because vsce does not support this kind of version number)
# npm version "0.0.1-$(node -p "(new Date).toISOString().replace(/:/g, '-')")"

vsce package
vsce publish
