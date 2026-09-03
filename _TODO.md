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

// builder

AI Assistant
Preview
Overview
Analytics
Personal
Templates
Help
Settings
Build and debug faster with the AI Assistant
Preview
Build and edit workflows through conversation
Debug failed executions and suggest fixes
Ask anything about n8n and get contextual help
Set up AI Assistant
Connect a model
The Assistant runs on a model you pay for directly. Your prompts, workflows, and the execution data it reads go to this provider.

Provider
Self-hosted or OpenAI-compatible endpoint
Base URL
http://ollama.internal:11434/v1
API key
Leave empty for Ollama
Model
qwen3-coder
Local and smaller open models can run the Assistant, but they often produce workflows that don't execute. Expect worse results than with a frontier model


ower way only way is to use ssh and insital the automating script and calling it from our dasboard so we dont have to do anyting or store any data on our server


we can do by just creating at beging of the docker create admin and api first and create memeber then done we use that to create login credentials for them so on click to move to panel we pass that tokn at the url /signin?token=[token] the login page only shows loading not any login form then move them to dashboar on login success done


### setuping owner
POST http://localhost:5678/rest/owner/setup
body {
    "email": "root@automate.et",
    "firstName": "root",
    "lastName": "admin",
    "password": "A12345678"
}
res n8n-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ5ODk5NDk0LWQwYTktNDVlZC04NGE2LWYyMmE4NTM5MTZjMSIsImhhc2giOiJSZWFzWjVVaHdlIiwiYnJvd3NlcklkIjoiTC9ucU9VZ251aE04VVZhaGNwNW92d1NUcVRiTVpreXlRUU5GbWEyWUtoRT0iLCJ1c2VkTWZhIjpmYWxzZSwiaWF0IjoxNzg4NDM1MDk4LCJleHAiOjE3ODkwMzk4OTh9.Yv7wvimgjMbHdkGp38SNrB5stsuB9ZApIozWp09TsqQ; Max-Age=604800; Path=/; Expires=Thu, 10 Sep 2026 11:31:38 GMT; HttpOnly; Secure; SameSite=Lax

### inivite
POST http://localhost:5678/rest/invitations
body [
    {
        "email": "user@n8n.com",
        "role": "global:member"
    }
]
response: data[0].user.inviteAcceptUrl 
"http://localhost:5678/signup?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnZpdGVySWQiOiI1ZmM0N2VlNC1hNThjLTQ0NTUtYmNlNS1mNzEwMDQwMWQwYTkiLCJpbnZpdGVlSWQiOiIzY2JiMjlhNC1kOTAyLTQ1ZWYtOWZjYy1iYzhhOTZiZTYyZmMiLCJpYXQiOjE3ODg0MzQwMzksImV4cCI6MTc5NjIxMDAzOX0.EUrkqecVYsE8DvbLvyXgMa9OS45R3XXjd8OEhbVzLSk"

### acept invite
POST http://localhost:5678/rest/invitations/accept
body {
    "firstName": "dag",
    "lastName": "ale",
    "password": "A12345678",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnZpdGVySWQiOiI1ZmM0N2VlNC1hNThjLTQ0NTUtYmNlNS1mNzEwMDQwMWQwYTkiLCJpbnZpdGVlSWQiOiIzY2JiMjlhNC1kOTAyLTQ1ZWYtOWZjYy1iYzhhOTZiZTYyZmMiLCJpYXQiOjE3ODg0MzQwMzksImV4cCI6MTc5NjIxMDAzOX0.EUrkqecVYsE8DvbLvyXgMa9OS45R3XXjd8OEhbVzLSk"
}

### login
post http://localhost:5678/rest/login
body {
    "emailOrLdapLoginId": "user@n8n.com",
    "password": "A12345678"
}
returns: n8n-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNjYmIyOWE0LWQ5MDItNDVlZi05ZmNjLWJjOGE5NmJlNjJmYyIsImhhc2giOiJ0a25iOXJMd3JjIiwiYnJvd3NlcklkIjoiTC9ucU9VZ251aE04VVZhaGNwNW92d1NUcVRiTVpreXlRUU5GbWEyWUtoRT0iLCJ1c2VkTWZhIjpmYWxzZSwiaWF0IjoxNzg4NDM0NTA4LCJleHAiOjE3ODkwMzkzMDh9.skVNcy5F7P-pByNyCAgOCWlOSELYtMjCIOPV_bsrpVg; Max-Age=604800; Path=/; Expires=Thu, 10 Sep 2026 11:21:48 GMT; HttpOnly; Secure; SameSite=Lax