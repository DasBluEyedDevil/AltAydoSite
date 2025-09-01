# Azure Discord Sync Job Setup

This guide shows you how to set up the automated Discord user sync job on Microsoft Azure using various Azure services.

## Option 1: Azure Logic Apps (Recommended - Easiest)

Azure Logic Apps is the simplest way to set up scheduled HTTP requests.

### Step-by-Step Setup

1. **Create a Logic App**
   - Go to Azure Portal → Create a resource → Logic App
   - Choose your subscription, resource group, and region
   - Select "Consumption" plan for cost-effectiveness
   - Click "Create"

2. **Configure the Workflow**
   - Open your Logic App → Logic app designer
   - Choose "Blank Logic App"
   - Add trigger: Search for "Recurrence" and select it
   - Set the schedule:
     - **Interval**: 6
     - **Frequency**: Hour
     - **Time zone**: Your preferred timezone
     - **At these hours**: 0, 6, 12, 18 (every 6 hours)

3. **Add HTTP Action**
   - Click "+ New step"
   - Search for "HTTP" and select "HTTP" action
   - Configure:
     - **Method**: GET
     - **URI**: `https://yourdomain.com/api/cron/discord-sync`
     - **Headers** (if using CRON_SECRET):
       ```
       Authorization: Bearer your-cron-secret
       ```

4. **Save and Enable**
   - Click "Save"
   - The Logic App will automatically start running on schedule

### Cost
- Very low cost (~$0.01-0.10 per month for this simple schedule)
- First 4,000 actions per month are free

---

## Option 2: Azure Functions with Timer Trigger

More advanced option with full control over the execution environment.

### Step-by-Step Setup

1. **Create Function App**
   - Azure Portal → Create a resource → Function App
   - Choose your subscription and resource group
   - **Runtime stack**: Node.js (or your preferred language)
   - **Plan type**: Consumption (Serverless)
   - Click "Create"

2. **Create Timer Function**
   - Open Function App → Functions → Create
   - Choose "Timer trigger" template
   - **Name**: `discord-sync-timer`
   - **Schedule**: `0 0 */6 * * *` (every 6 hours)
   - Click "Create"

3. **Add Function Code**
   
   **JavaScript/Node.js example**:
   ```javascript
   module.exports = async function (context, myTimer) {
       const https = require('https');
       
       const options = {
           hostname: 'yourdomain.com',
           port: 443,
           path: '/api/cron/discord-sync',
           method: 'GET',
           headers: {
               'Authorization': 'Bearer ' + process.env.CRON_SECRET // Optional
           }
       };

       return new Promise((resolve, reject) => {
           const req = https.request(options, (res) => {
               let data = '';
               res.on('data', (chunk) => data += chunk);
               res.on('end', () => {
                   context.log('Discord sync response:', data);
                   resolve(data);
               });
           });

           req.on('error', (error) => {
               context.log.error('Discord sync error:', error);
               reject(error);
           });

           req.end();
       });
   };
   ```

4. **Configure Environment Variables**
   - Function App → Configuration → Application settings
   - Add `CRON_SECRET` if you're using it
   - Add `WEBSITE_TIME_ZONE` for your timezone (e.g., "Eastern Standard Time")

### Cost
- Very low cost with Consumption plan
- First 1 million executions per month are free

---

## Option 3: Azure Container Instances (Advanced)

For more complex scenarios or if you want to run the sync logic directly in Azure.

### Step-by-Step Setup

1. **Create Container Registry** (Optional)
   - Azure Portal → Container registries → Create
   - Upload your Discord sync application as a container

2. **Create Container Instance**
   - Azure Portal → Container instances → Create
   - Use a lightweight container with cron capability
   - Configure environment variables for your API endpoint

3. **Set up Cron Job**
   ```dockerfile
   # Example Dockerfile
   FROM node:alpine
   RUN apk add --no-cache curl
   COPY cron-job.sh /usr/local/bin/
   RUN chmod +x /usr/local/bin/cron-job.sh
   
   # Add cron job
   RUN echo "0 */6 * * * /usr/local/bin/cron-job.sh" | crontab -
   
   CMD ["crond", "-f"]
   ```

---

## Option 4: Azure DevOps Pipelines (If using Azure DevOps)

Use Azure DevOps scheduled pipelines to trigger the sync.

### Step-by-Step Setup

1. **Create Pipeline**
   - Azure DevOps → Pipelines → New pipeline
   - Choose your repository or "Empty job"

2. **Configure Schedule**
   ```yaml
   # azure-pipelines.yml
   schedules:
   - cron: "0 */6 * * *"
     displayName: Discord Sync Every 6 Hours
     branches:
       include:
       - main
     always: true

   jobs:
   - job: DiscordSync
     pool:
       vmImage: 'ubuntu-latest'
     steps:
     - task: PowerShell@2
       displayName: 'Trigger Discord Sync'
       inputs:
         targetType: 'inline'
         script: |
           $headers = @{
               'Authorization' = 'Bearer $(CRON_SECRET)'
           }
           Invoke-RestMethod -Uri 'https://yourdomain.com/api/cron/discord-sync' -Headers $headers
   ```

3. **Set Variables**
   - Pipeline → Variables → Add `CRON_SECRET`

---

## Recommended Setup: Azure Logic Apps

For your use case, **Azure Logic Apps** is the best choice because:

✅ **Simplest to set up** - Visual designer, no coding required  
✅ **Most reliable** - Managed service with automatic retries  
✅ **Cheapest** - Very low cost for simple HTTP requests  
✅ **Easy monitoring** - Built-in run history and logging  
✅ **No maintenance** - Fully managed by Microsoft  

### Quick Logic Apps Setup

1. **Create Logic App** → Choose "Consumption" plan
2. **Add Recurrence trigger** → Every 6 hours
3. **Add HTTP action** → GET `https://yourdomain.com/api/cron/discord-sync`
4. **Add Authorization header** (if using CRON_SECRET)
5. **Save** → Done!

### Environment Variables for Your Site

Make sure these are set in your App Service configuration:

```env
# Required
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id

# Optional security
CRON_SECRET=your-secure-random-string
```

### Monitoring

**Logic Apps Monitoring:**
- Logic App → Overview → Runs history
- See success/failure status for each execution
- View detailed logs and error messages

**Your App Logs:**
- App Service → Log stream
- Monitor the Discord sync execution logs

### Testing

**Manual Test:**
- Logic App → Overview → Run Trigger → Recurrence
- This will immediately execute your sync job

**Endpoint Test:**
```bash
# Test your endpoint directly
curl -H "Authorization: Bearer your-cron-secret" https://yourdomain.com/api/cron/discord-sync
```

### Troubleshooting

**Common Issues:**

1. **"Unauthorized" error**
   - Check CRON_SECRET is set correctly in both places
   - Verify Authorization header format: `Bearer your-secret`

2. **"Discord bot token not configured"**
   - Ensure DISCORD_BOT_TOKEN is set in App Service configuration
   - Restart your App Service after adding environment variables

3. **Logic App not triggering**
   - Check the recurrence schedule is correct
   - Verify Logic App is enabled (not disabled)
   - Check Azure service health

4. **Sync not finding users**
   - Users need Discord information in their profiles
   - Check bot has proper permissions in Discord server
   - Verify DISCORD_GUILD_ID matches your server

### Cost Estimation

**Logic Apps (Recommended):**
- ~$0.01-0.05 per month (4 executions per day)
- First 4,000 actions/month are free

**Azure Functions:**
- ~$0.00-0.01 per month (very low usage)
- First 1 million executions/month are free

Both options are essentially free for this use case!

The Logic Apps approach is perfect for your needs - set it once and forget it. Your Discord user profiles will automatically stay in sync with server roles every 6 hours.
