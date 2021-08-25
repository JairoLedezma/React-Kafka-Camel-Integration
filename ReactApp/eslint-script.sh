#!/bin/bash

cd ./ReactApp

npm install -g eslint-plugin-react

eslint --no-color --format json --ext .ejs,.js --output-file ./reports/eslint-report ./

echo $? > /dev/null
