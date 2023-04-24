#!/bin/bash

# Set default values for username and password
username="ypicker"
password="password"

# Check if arguments are provided and use them if available
if [ $# -ge 2 ]; then
    username="$1"
    password="$2"
fi

# Send the request using curl with the --insecure flag and store the response
response=$(curl -s -k -X POST -H "Content-Type: application/json" \
     -d "{\"username\": \"$username\", \"password\": \"$password\"}" \
     https://localhost/api/v1/auth/signin)

# Extract the accessToken from the response using Python
accessToken=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['resource']['accessToken'])")

# Echo the formatted output
echo "{ \"Authorization\": \"Bearer $accessToken\" }"
