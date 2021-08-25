#!/bin/bash
eslint --no-color --format json --ext .ejs,.js --output-file ./ReactApp/reports/eslint-report.xml ./

echo $? > /dev/null
