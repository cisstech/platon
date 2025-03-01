#!/bin/bash -e

# Parse web component documentation from source code and generate mdx files to docs folder

rm -rf apps/docs/pages/components/forms
rm -rf apps/docs/pages/components/widgets

yarn nx g @platon/cli:wc-docs
