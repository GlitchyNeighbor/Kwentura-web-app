Kwentura — Quick Local Install & Dummy Accounts

This file explains, in plain language, how to run the Kwentura web site on your own Windows PC (localhost) and how to create or use simple dummy user accounts for testing.

1 What you need (very small)
- A Windows PC with internet access.
- Node.js (recommended LTS). You can download it from https://nodejs.org/. Installing Node also gives you npm (the Node package manager).
- The project folder (the source files). If someone gave you the project, place the folder somewhere convenient (for example: C:\Users\YourName\Projects\Kwentura).

2 Open PowerShell in the project folder
- Open File Explorer and navigate to the project folder.
- Click the address bar, type "powershell", and press Enter. This opens PowerShell in the current folder.

3 Install the app's required packages (one-time)
In the PowerShell window run:

# Install dependencies (may take a minute)
npm install

Wait until npm finishes. This downloads the packages the app needs.

4 Start the app locally (run the website on your computer)
After installation, start the local web server with:

# Start the development server (will open at http://localhost:3000)
npm start

When the server starts, open your web browser and go to:
http://localhost:3000

You should see the Kwentura site running locally on your computer.

5 Creating and using dummy user accounts(teacher account) (simple — recommended)
The easiest way to get test users is to register them using the site itself:
- Click "Sign Up" on the site.
- Fill in the First name, last name, contact number, email address, school Id, level, section, and password. The test user needs to verify the email address by putting an email, and clicking the verify button. This will open a modal that will send a verification link to the email address, the email may be in the dump/trash folder or spam folder. Once the verification link is clicked, go back to the kwentura website and click the "I've verified my email" button.
- Once the email is verified, click the checkbox next to the "I agree to the Terms and Conditions and Privacy Policy" to enable the Complete Registration button.
- After signing up, the account is now registered and is pending for an admin approval before it is able to be used.

Suggested dummy accounts you can create (use these exact School ID and passwords while testing):
- Super Admin: 2022-154174  / SuperAdmin123!
- Admin: 2022-135798 / Admin123!
- Teacher: 2022-123456  / Teacher123!

6 Quick login steps
- Go to the site at http://localhost:3000
- Click "Log In"
- Enter one of the email/password pairs you created and click Submit.
- You should be redirected to the appropriate dashboard (Admin or Teacher) depending on the account type.

7 Stopping the server
- In PowerShell, press Ctrl+C to stop the running local server.

8 Troubleshooting (common problems)
- "npm not recognized": Node.js is not installed or your PATH was not updated. Re-run the Node installer, then re-open PowerShell.
- "Port 3000 already in use": Another app is using port 3000. Close that app or start the project on another port with:

# Start on port 3001, for example (PowerShell)
$env:PORT=3001; npm start

- Signup or login fails: Make sure you completed installation (`npm install`) and the server is running. If your copy uses remote services (Firebase) and you see network errors, ask the provider of the files for a local-friendly configuration or try again with network access enabled.

9 Notes and safety
- This local setup is for testing and learning only. Do not expose your local server to the public internet unless you know what you're doing.
- Dummy passwords (like Password123!) are fine for local testing but never use them for real accounts.

10 If you want pre-created accounts (advanced — optional)
If you prefer not to register accounts manually, ask the person who supplied this project to provide "seeded" accounts or an import file. That usually requires the developer to load them into the authentication system.

11 Need help?
If you get stuck, please contact the person who gave you the project and tell them the exact error messages you see in PowerShell or the browser. Include screenshots if possible.

Enjoy exploring Kwentura locally!