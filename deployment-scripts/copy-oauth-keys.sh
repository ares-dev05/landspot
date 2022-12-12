#!/bin/bash 

# Load environment variables
source /etc/profile

# Go to laravel storage directory
cd /var/www/landspot/deployment/discovery/storage

# Copy oauth keys to storage
cp /var/www/landspot/keys/oauth-private.key oauth-private.key
cp /var/www/landspot/keys/oauth-public.key oauth-public.key