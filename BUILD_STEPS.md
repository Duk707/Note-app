# Build Steps

This project will be developed incrementally. Each step should be completed
and verified before beginning the next step.

## Step 1 - Project Planning

- Define the Notes App idea.
- Create PLAN.md.
- Create the GitHub repository.
- Create AGENTS.md.
- Create BUILD_STEPS.md.

### Verify

- Planning files exist.
- Git repository is connected to GitHub.
- Files are committed and pushed.

---

## Step 2 - Frontend Project Setup

- Create a React project using Vite and TypeScript.
- Install required dependencies.
- Create the initial project structure.
- Add a basic application page.
- Create .gitignore.
- Create .env.example.

### Verify

- Development server starts successfully.
- Application loads in the browser.
- No build errors occur.

---

## Step 3 - Supabase Setup

- Create a Supabase project.
- Configure the Supabase client.
- Add Supabase environment variables.
- Create the notes database table.
- Configure Row Level Security.

### Verify

- React application can connect to Supabase.
- Database exists.
- Security policies are enabled.

---

## Step 4 - User Registration

- Create the registration page.
- Allow users to register using email and password.
- Display registration errors clearly.

### Verify

- A new user can register.
- The user appears in Supabase Authentication.
- Invalid registration attempts display an error.

---

## Step 5 - Login and Logout

- Create the login page.
- Implement user login.
- Implement user logout.
- Maintain authentication state.

### Verify

- Registered users can log in.
- Invalid credentials are rejected.
- Users can log out successfully.
- Authentication state behaves correctly after refreshing the page.

---

## Step 6 - Protected Notes Dashboard

- Create the Notes Dashboard.
- Require authentication to access the dashboard.
- Redirect unauthenticated users to the login page.

### Verify

- Logged-in users can access the dashboard.
- Logged-out users cannot access the dashboard.

---

## Step 7 - Read Notes

- Retrieve the logged-in user's notes from Supabase.
- Display notes on the dashboard.
- Show an empty state when no notes exist.

### Verify

- Notes load successfully.
- Users only see their own notes.

---

## Step 8 - Create Notes

- Create a form for adding notes.
- Store the note title and content in Supabase.

### Verify

- A user can create a note.
- The new note appears on the dashboard.
- The note is stored in Supabase.

---

## Step 9 - Update Notes

- Allow users to edit existing notes.
- Update the last-modified timestamp.

### Verify

- A note can be edited.
- Changes persist after refreshing the page.

---

## Step 10 - Delete Notes

- Allow users to delete notes.
- Ask for confirmation before deletion.

### Verify

- A note can be deleted.
- Deleted notes disappear from the database and interface.

---

## Step 11 - Validation and Error Handling

- Validate forms.
- Add loading states.
- Add useful error messages.
- Prevent duplicate submissions.

### Verify

- Invalid input is handled correctly.
- Network/database errors do not crash the application.

---

## Step 12 - Final UI Cleanup

- Make the interface easy to navigate.
- Ensure the application works on desktop and mobile.
- Fix visual or usability problems.

### Verify

- All major pages are functional.
- CRUD and authentication still work correctly.

---

## Step 13 - Netlify Deployment

- Prepare the production build.
- Configure Netlify.
- Add production environment variables.
- Configure routing for the React application.
- Deploy the completed application.

### Verify

- The public Netlify URL works.
- Registration and login work on the deployed version.
- CRUD works on the deployed version.

---

## Step 14 - Documentation and Demo

- Complete README.md.
- Add the deployed application URL.
- Document technologies and setup instructions.
- Record the required demonstration video.
- Add the video link to the README.

### Verify

- GitHub repository contains the required documentation.
- Demo uses the deployed application rather than localhost.