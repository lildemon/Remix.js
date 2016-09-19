#!/bin/sh
coffee -c remix.coffee
uglifyjs remix.js -c -m -o remix.min.js
