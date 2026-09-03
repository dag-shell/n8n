## contabo
we buy the max plan and claffiy it and resell it

4 vCPU Cores  | per cpu core
8 GB RAM      | per RAM
100 GB SSD    | per storage

so cusomers order based one resource they want we set minimum requirements to run n8n as guide

we make the resource selection in drop down so we dont create unsed part from our holebuyed max plan
e.g we buy 6 vCPU Cores,12 GB RAM,200 GB SSD Cores the drop down will be
- 1 vCPU Core,2 GB RAM,50 GB SSD
- 2 vCPU Corest,4 GB RAM,100 GB SSD
- 4 vCPU Cores,8 GB RAM,200 GB SSD
- 6 vCPU Cores,12 GB RAM,200 GB SSD


## task
[ ] move n8n reset api separately to our main server
[ ] put it in our dasboard project
[ ] build our hosting dashborad with user account page and pricing and all mini stuffs

[ ] using docker to mimic the n8n runings



we can do by just creating at beging of the docker create admin and api first and create memeber then done we use that to create login credentials for them so on click to move to panel we pass that tokn at the url /signin?token=[token] the login page only shows loading not any login form then move them to dashboar on login success done


N8N_INSTANCE_OWNER_MANAGED_BY_ENV=true
N8N_INSTANCE_OWNER_EMAIL=tenant@n8panel.com                            
N8N_INSTANCE_OWNER_PASSWORD=SuperSecretPassword123
N8N_INSTANCE_OWNER_FIRST_NAME=Tenant
N8N_INSTANCE_OWNER_LAST_NAME=User     
N8N_INITIAL_API_KEY=n8n_api_tenant_secret_key_987654321



// creating user
// login user is by the rest api