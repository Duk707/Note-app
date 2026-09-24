# Notes App

A full-stack personal notes application built for an Engineering Design 2 assignment using React, TypeScript, Supabase, and Netlify. The application enables authenticated users to register, log in, create, view, edit, and delete their own personal notes with security enforced at the database level via Supabase Row Level Security (RLS).

---

## Live Application

- **Production Deployment URL**: [https://jrc-fau-note-app.netlify.app](https://jrc-fau-note-app.netlify.app)

---

## Demonstration Video

- **Video Link**: `[Demonstration Video Placeholder - Unlisted YouTube URL to be added]`

### Demo Recording Checklist

The required demonstration video will cover the following requirements:
- [ ] **Length**: 3 to 5 minutes long.
- [ ] **Environment**: Recorded using the live deployed Netlify application ([https://jrc-fau-note-app.netlify.app](https://jrc-fau-note-app.netlify.app)), not localhost.
- [ ] **Authentication Flow**: Demonstrate new user registration, login, session persistence, and logout.
- [ ] **Database & CRUD Functionality**: Show creating, reading, editing, and deleting notes and verify that the changes persist in Supabase.
- [ ] **Code & Project Walkthrough**: Briefly walk through the codebase structure, Supabase client initialization, RLS configuration, and Netlify deployment setup.
- [ ] **Privacy**: Published as an unlisted YouTube video.

---

## Architecture Overview

The Notes App uses a modern serverless client-database architecture:

```text
[ React / TypeScript SPA ]  <--->  [ Supabase Authentication ] (User Sessions & JWT)
         |                                     |
    (Netlify CDN)                     [ Supabase PostgreSQL ]
                                       (RLS: auth.uid() = user_id)
```

1. **Frontend**: A React Single Page Application (SPA) bundled with Vite and hosted globally on Netlify CDN.
2. **Authentication**: Supabase Auth handles user registration and password authentication and manages authentication sessions on the client.
3. **Database & Security**: A Supabase PostgreSQL database stores note records. Row Level Security (RLS) policies automatically validate incoming requests against `auth.uid()`, guaranteeing that users can only query, insert, update, or delete their own data.

---

## Technology Stack

- **Frontend Library**: React `^18.3.1` (with `react-dom` `^18.3.1`)
- **Build Tool**: Vite `^5.4.1` (`@vitejs/plugin-react` `^4.3.1`)
- **Language**: TypeScript `^5.5.3`
- **Backend & SDK**: `@supabase/supabase-js` `^2.117.1` (Supabase Auth & PostgreSQL)
- **Styling**: Vanilla CSS (Custom Dark Glassmorphic Design System)
- **Deployment & Hosting**: Netlify (`netlify.toml` SPA configuration)

---

## Application Features

- **User Registration**: Client-validated email and password signup.
- **Authentication & Login**: Password authentication with error catching and invalid credential handling.
- **Session Persistence**: Automatic session restoration on page refresh and active authentication state listener.
- **Protected Notes Dashboard**: Restricted interface accessible strictly when authenticated.
- **Create Notes**: Add personal notes with title and content, automatically attached to the user's ID.
- **Read Notes**: Fetch and display notes in a responsive card grid, with explicit column queries, empty states, and loading spinners.
- **Update Notes**: Edit existing note titles and contents with timestamp tracking (`updated_at`).
- **Delete Notes**: Remove notes with explicit user confirmation prompts.
- **User Logout**: Securely sign out and terminate active sessions.
- **Responsive & Accessible UI**: Responsive layout for mobile and desktop screens, overflow protection, and `:focus-visible` accessibility rings.

---

## Data Model & Security Architecture

### Database Table: `notes`

| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` |
| `user_id` | `uuid` | References `auth.users(id)`, Foreign Key |
| `title` | `text` | Note title (required) |
| `content` | `text` | Note content (required) |
| `created_at` | `timestamptz` | Creation timestamp |
| `updated_at` | `timestamptz` | Last modified timestamp |

### Row Level Security (RLS) Policies

Row Level Security is enabled on the `notes` table with the following policies for the `authenticated` role:
- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id`

Unauthenticated (`anon`) access to table rows is completely revoked.

---

## Usage Guide

1. **Register**: Click the **Register** tab, enter a valid email address and password (min 6 characters), confirm the password, and click **Register Account**.
2. **Log In**: Click the **Log In** tab, enter your registered credentials, and click **Log In**.
3. **View Notes**: Upon authenticating, the Protected Notes Dashboard automatically loads your personal notes.
4. **Create a Note**: Click **+ Create Note**, fill in the title and content, and click **Save Note**.
5. **Edit a Note**: Click the **Edit** button on a note card, modify the title or content, and click **Save Changes**.
6. **Delete a Note**: Click the **Delete** button on a note card, confirm the prompt ("Confirm Delete"), and the note will be removed.
7. **Log Out**: Click **Log Out** in the dashboard header bar to terminate your session and return to the login interface.

---

## Environment Variables

To run the project locally or deploy it to Netlify, create an environment configuration using placeholders (do not expose real secret keys):

### `.env.local` Template
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

> **Security Note**: Never commit `.env` or `.env.local` files to Git repositories.

---

## Local Installation & Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Duk707/Note-app.git
   cd Note-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   Open the local URL(localhost) shown in the terminal after starting the development server.

5. **Build for production**:
   ```bash
   npm run build
   ```
