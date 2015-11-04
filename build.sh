#!/bin/sh
coffee -c Remix.coffee
uglifyjs remix.js -c -m -o remix.min.js