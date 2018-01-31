#!/bin/bash

web-ext build
for i in web-ext-artifacts/*.zip ; do
    mv "$i" "${i/.zip/.xpi}"
done
