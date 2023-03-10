#!/bin/bash

# Adds clear-tmp.sh to cronjob
sudo crontab -l | {
  cat; echo "0 2 * * * /home/www-deployment/www/mountapollo.com/lc-discovery/deployment-scripts/clear-tmp.sh";
} | sudo crontab -

sudo crontab -l