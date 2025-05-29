#!/bin/bash

# Ensure PATH includes Terraform
export PATH="/opt/homebrew/bin:$PATH"

# Set default working directory (your GitHub project)
cd ~/cloud-resume-challenge || exit

# Confirm key tools
echo "✅ Current directory: $PWD"
echo "✅ Git status:"
git status

echo "✅ Terraform version:"
terraform -v
