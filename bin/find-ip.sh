#!/bin/bash -e

OS=$(uname -s)

if [ "$OS" = "Darwin" ]; then
  # https://stackoverflow.com/a/46565139
  ipconfig getifaddr en0
else
  # https://stackoverflow.com/a/49552792
  ip -o route get to 8.8.8.8 | sed -n 's/.*src \([0-9.]\+\).*/\1/p'
fi
