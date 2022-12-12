#!/bin/bash 

# --------------------------------------------------------
# This script backs up current deployment and creates new deployment folder.
# --------------------------------------------------------
DEPLOYMENT_TIME=$( date -u "+%Y/%m/%d %H:%M:%S" )
echo "Deployment started at: "$DEPLOYMENT_TIME" UTC" > /var/www/landspot/deployment/deployment_time.txt

# Remove if previous deployment folder exists
rm -rf /var/www/landspot/prev-deployment

# Backup current deployment
# Additional comment for testing
mv /var/www/landspot/deployment /var/www/landspot/prev-deployment

# Create new deployment folder and make deploy-user owner
mkdir /var/www/landspot/deployment

# Copy the previous installed packages to make the installation quicker and more stable
cp -r /var/www/landspot/prev-deployment/discovery/node_modules /var/www/landspot/deployment/discovery/node_modules

chown deploy-user:www-data /var/www/landspot/deployment
