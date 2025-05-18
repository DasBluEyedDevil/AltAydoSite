# Set environment variables needed for Amplify deployment
$env:AMPLIFY_APP_ID = "d1yp755hftiq2j"
$env:AMPLIFY_BRANCH = "main"
$env:AWS_REGION = "us-east-1"

# Also set AWS_ variables for backward compatibility
$env:AWS_APP_ID = $env:AMPLIFY_APP_ID
$env:AWS_BRANCH = $env:AMPLIFY_BRANCH

# Display the values to confirm
Write-Host "Set Amplify environment variables:"
Write-Host "AMPLIFY_APP_ID: $env:AMPLIFY_APP_ID"
Write-Host "AMPLIFY_BRANCH: $env:AMPLIFY_BRANCH" 
Write-Host "AWS_REGION: $env:AWS_REGION"

# Generate Amplify backend resources
Write-Host "Generating Amplify backend resources..."
npx ampx generate outputs --app-id "$env:AMPLIFY_APP_ID" --branch "$env:AMPLIFY_BRANCH"

# Run the build command with these variables
Write-Host "Running build command with new environment variables..."
npm run build 
