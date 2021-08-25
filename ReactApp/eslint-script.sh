#!/bin/bash

cd ./workspace/lint-react

eslint --no-color --format json --ext .ejs,.js --output-file /{JENKINS HOME DIRECTORY}/reports/eslint-report ./

echo $? > /dev/null
