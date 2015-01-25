#!/bin/sh
coffee -c Remix.coffee
uglifyjs Remix.js > Remix.min.js