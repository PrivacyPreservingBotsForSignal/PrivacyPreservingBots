#!/usr/bin/env zsh

echo "RUNNING RECEIVE FOR PORT $1 WITH NUMBER $2"
curl -X GET "127.0.0.1:$1/v1/receive/$2" > /dev/null 2> /dev/null