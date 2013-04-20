#!/bin/bash
../bin/ghw -c conf.json -i jswiki.wiki -o out -t templates -s
cp -r templates/[!.]* out

