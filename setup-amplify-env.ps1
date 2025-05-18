# Set environment variables needed for Amplify deployment
$env:AWS_APP_ID = "d3ohapvt0eajka"
$env:AWS_BRANCH = "main"
$env:AWS_REGION = "us-east-1"

# Display the values to confirm
Write-Host "Set Amplify environment variables:"
Write-Host "AWS_APP_ID: $env:AWS_APP_ID"
Write-Host "AWS_BRANCH: $env:AWS_BRANCH" 
Write-Host "AWS_REGION: $env:AWS_REGION"

# Run the build command with these variables
Write-Host "Running build command with new environment variables..."
npm run build 