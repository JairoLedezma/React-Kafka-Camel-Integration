#!/bin/bash

cd ./ReactApp

eslint --no-color --format json --ext .ejs,.js --output-file ./reports/eslint-report ./

echo $? > /dev/null
