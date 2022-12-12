#!/bin/bash 

# Load environment variables
source /etc/profile

# Go to source/discovery directory
cd /var/www/landspot/deployment/discovery

#npm run sitings-prod
npm install es6-promise
#install phantomjs manually
npm install phantomjs2
npm run prod
