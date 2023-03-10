#!/bin/bash

# Script for cleaning /tmp folder
sudo find /tmp -type f -exec rm -f {} \;

