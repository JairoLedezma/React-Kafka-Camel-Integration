#!/bin/bash

cd /{JENKINS HOME DIRECTORY}/workspace/node-lint-pipeline

eslint --no-color --format json --ext .ejs,.js > ./ReactApp/reports/eslint-report ./

echo $? > /dev/null
