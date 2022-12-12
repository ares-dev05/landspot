#!/bin/bash 

# Load environment variables
source /etc/profile

# Go to source/discovery directory
cd /var/www/landspot/deployment/discovery

php artisan migrate --force
php artisan migrate:blog --force
