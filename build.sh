#!/bin/bash

rm -rf dist && mkdir dist
npx babel src --out-dir dist --copy-dot-files --ignore src/node_modules
cp src/package.json dist
cp src/.env dist
cd dist && npm install --production