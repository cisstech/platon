#!/usr/bin/env bash
# Runs the Foundry CLI on the wireframes of design/, in the version this repository is checked with.
# Usage: ./bin/foundry.sh <check|serve|build> [options]; an --out path must be absolute.
set -euo pipefail

# Authorize the execution of this script from anywhere
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR/.."

exec npx --yes @cisstech/foundry@0.1.0-beta.2 -C design "$@"
