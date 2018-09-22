#!/bin/bash

web-ext build
for i in web-ext-artifacts/*.zip ; do
    mv "$i" "${i/.zip/.xpi}"
done

latest="$(ls web-ext-artifacts/ -1t | head -1)";
echo "latest: $latest"
if [ $latest != "latest.xpi" ]; then
	echo "Updating latest.xpi"
	cp "web-ext-artifacts/"$latest "web-ext-artifacts/latest.xpi"
else
	echo "Not updating latest.xpi"
fi
