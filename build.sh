#!/bin/sh
coffee -c Remix.coffee
uglifyjs Remix.js -c -m -o Remix.min.js