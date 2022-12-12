#!/bin/bash

# ----------------------------------------------------------------
# This script makes final arrangements and restart nginx 
# to complete the installation.
# ----------------------------------------------------------------

# Load environment variables
source /etc/profile

# Print deployment info
DEPLOYMENT_TIME=$( date -u "+%Y/%m/%d %H:%M:%S" )
echo "Deployment finished at: "$DEPLOYMENT_TIME" UTC" >> /var/www/landspot/deployment/deployment_time.txt

# Arrange folder permissions
chown -R deploy-user:www-data /var/www/landspot/deployment
chmod -R 775 /var/www/landspot/deployment/discovery

chown -R deploy-user:www-data /tmp/landspot/views
chmod -R 775 /tmp/landspot/views

#Restart nginx
service nginx restart

#Restart notification services
systemctl restart laravel-queue.service