#!/bin/sh
export PATH="/Users/saugat.yadav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
NODE=/Users/saugat.yadav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
NPM_CLI=/Users/saugat.yadav/.cache/npm-bootstrap/package/bin/npm-cli.js
cd /Users/saugat.yadav/Desktop/code/body
exec "$NODE" "$NPM_CLI" run dev
