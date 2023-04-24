#!/bin/bash -e

# Authorize the execution of this script from anywhere
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/../.."

npx ts-jison -t typescript -n PL -n PL -o libs/feature/compiler/src/lib/pl.parser.ts libs/feature/compiler/src/lib/pl.jison
