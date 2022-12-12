#!/bin/bash 

# Load environment variables
source /etc/profile

# Go to source/discovery directory
cd /var/www/landspot/deployment/discovery

#npm-cache install && npm-cache install --only=dev
npm install && npm install --only=dev

#run postinstall
npm run postinstall
