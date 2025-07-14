#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug() {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky:debug $*"
  }
  husky_dir="$(cd "$(dirname "$0")/.." && pwd -P)"
  debug "husky_dir: $husky_dir"
  readonly husky_dir
  export PATH="$husky_dir/bin:$PATH"
fi
