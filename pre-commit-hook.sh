#!/bin/bash

# run "npm run setup" to automatically build dist/index.js on commit

set -euxo pipefail

npm run build && git add dist/index.js && exit 0