#!/bin/bash 

# Load environment variables
source /etc/profile

# Go to source/discovery directory
cd /var/www/landspot/deployment/discovery

# Create uploaded_files folder for application
mkdir storage/app/public/uploaded_files

php artisan storage:link
php artisan config:cache
