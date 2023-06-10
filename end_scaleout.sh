#!/usr/bin/env zsh

for i in {0..$1..1}
do
    echo Killing bot $i
    docker kill signal-bot-$i
done

