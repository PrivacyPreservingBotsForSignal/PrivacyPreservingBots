#!/bin/bash 

while true; do
    node dist/index.js
    EXITCODE=$?
    if [ $EXITCODE -ne 69 ]; then
        echo "Failed due to error code $EXITCODE"
        break
    fi
done