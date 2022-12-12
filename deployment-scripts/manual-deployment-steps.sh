#!/bin/bash 

# --------------------------------------------------------
# This script backs up current deployment and creates new deployment folder.
# --------------------------------------------------------
DEPLOYMENT_TIME=$( date -u "+%Y/%m/%d %H:%M:%S" )
echo "Deployment started at: "$DEPLOYMENT_TIME" UTC" > /var/www/landspot/deployment/deployment_time.txt

# run all steps as super user
sudo -i

# Remove if previous deployment folder exists
rm -rf /var/www/landspot/prev-deployment

# Backup current deployment 
mv /var/www/landspot/deployment /var/www/landspot/prev-deployment

# Create new deployment folder and make deploy-user owner
cd /var/www/landspot/

# clone the repository
git clone https://mihai-at-818523324745:6s0ViNDSND+R1zwo0uJ4yU3k7dOofylycr+Nfaj5w9M=@git-codecommit.ap-southeast-2.amazonaws.com/v1/repos/landspot

mv /var/www/landspot/landspot /var/www/landspot/deployment

cp -r /var/www/landspot/prev-deployment/discovery/node_modules /var/www/landspot/deployment/discovery/node_modules

chown deploy-user:www-data /var/www/landspot/deployment

# Go to deployment directory
cd /var/www/landspot/deployment/discovery

# Remove if there is an existing environment configuration file
rm -f .env

# Link the environment configuration to shared configuration file
ln -s /var/www/landspot/config/.env .env

# install composer dependencies
composer install --no-dev

#npm-cache install && npm-cache install --only=dev
npm install && npm install --only=dev

#run postinstall
npm run postinstall

# Create uploaded_files folder for application
mkdir storage/app/public/uploaded_files

# Storage linking
php artisan storage:link
php artisan config:cache

# DB Migrations
php artisan migrate --force
php artisan migrate:blog --force

#Run NPM builds
npm install es6-promise
npm install phantomjs2

npm run prod
npm run sitings-prod

# Go to laravel storage directory
cd /var/www/landspot/deployment/discovery/storage

# Copy oauth keys to storage
cp /var/www/landspot/keys/oauth-private.key oauth-private.key
cp /var/www/landspot/keys/oauth-public.key oauth-public.key

# Go to source/discovery directory
cd /var/www/landspot/deployment/discovery
php artisan sitemap:generate

# Arrange folder permissions
chown -R deploy-user:www-data /var/www/landspot/deployment
chmod -R 775 /var/www/landspot/deployment/discovery

chown -R deploy-user:www-data /tmp/landspot/views
chmod -R 775 /tmp/landspot/views

#Restart nginx
service nginx restart

#Restart notification services
systemctl restart laravel-queue.service
