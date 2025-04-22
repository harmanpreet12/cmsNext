# Next.js Authentication App with Headless CMS

This project is a Next.js application that demonstrates user authentication and integration with a headless CMS (Strapi).

## Features

-   User authentication (Sign up, Login, Logout) using NextAuth.js.
-   Headless CMS using Strapi for content management.
-   Dashboard page that displays the logged-in user's email.
-   Protected routes (Dashboard redirects to home if not logged in).
-   Responsive navigation bar (header) with mobile toggle, centered on the page.
-   6-page routing system (Home, About, Services, Portfolio, Contact, and Login).

## Tech Stack

-   **Frontend:** Next.js
-   **Authentication:** NextAuth.js
-   **CMS:** Strapi
-   **Styling:** Tailwind CSS

## Project Structure
The project consists of two main parts: the Next.js frontend application (`nextjs-app`) and the Strapi CMS backend (`nextjs-app/cms`).

### Frontend (`nextjs-app`)
- `app/`: Contains the main application logic, including pages and API routes.
  - `page.tsx`: The home page with login/signup form.
  - `dashboard/page.tsx`: The dashboard page, accessible after login.
  - `api/auth/[...nextauth]/route.ts`: Handles authentication requests.
- `components/`: Reusable UI components.
  - `AuthButton.tsx`: Component for login/logout button.
  - `AuthForm.tsx`: Component for the login/signup form.
- `providers.tsx`: Provides NextAuth session context to the app.
- `about/page.tsx`: The About page.
- `services/page.tsx`: The Services page.
- `portfolio/page.tsx`: The Portfolio page.
- `contact/page.tsx`: The Contact page.
- `login/page.tsx:` The Login page with a form for sign-up and sign-in.
- `components/`: Reusable UI components
- `Navbar.tsx`: A responsive navigation bar component with links to all pages.
### Backend (Strapi CMS - `nextjs-app/cms`)
- Standard Strapi project structure.
- Configured to run as a separate service.

## Getting Started

### Prerequisites

-   Node.js (v18 or later) and npm installed.
- This project uses environment variables for configuration. Create `.env` files in both the `nextjs-app` and `nextjs-app/cms` directories. Refer to the `.env.example` files for the required variables. You will need to set up a database and configure the CMS accordingly.

### 1. Set up the CMS (Strapi)

```bash
cd nextjs-app/cms
npm install
npm run develop
```

-   This will start the Strapi development server. Follow the Strapi instructions to create an admin user and set up your content types.

### 2. Set up the Next.js App

```bash
cd ../../nextjs-app # Navigate back to the root of the nextjs-app
npm install
npm run dev
```

-   This will start the Next.js development server. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables
Make sure to populate the `.env` files in both `nextjs-app` and `nextjs-app/cms` with the appropriate values. The `.env.example` files provide guidance on the required variables.

## Implementation Details

-   **Authentication:** NextAuth.js is used for authentication. It's configured in `nextjs-app/app/api/auth/[...nextauth]/route.ts`.  The `AuthButton` and `AuthForm` components handle user interaction.
-   **CMS Integration:**  The Next.js app is designed to interact with the Strapi CMS.  Currently, the CMS is set up but not actively used in the frontend.
- **Dashboard:** The dashboard page (`app/dashboard/page.tsx`) retrieves the user session using `getServerSession`. If no session is found, it redirects to the home page. If a session exists, it displays the user's email.
- **Navigation Bar**: A responsive Navbar component (components/Navbar.tsx) is implemented, centered on the page, with links to Home, About, Services, Portfolio, Contact, and Login pages. It uses Tailwind CSS for styling and includes a mobile toggle menu.
- **Pages**: The app includes 6 pages (Home, About, Services, Portfolio, Contact, and Login), all accessible via the navigation bar. The Login page uses a CSS module for styling, while other pages rely on inline styles or Tailwind classes for basic layout.

## Dashboard Features

The dashboard section allows users to have a tailored experience with multiple primary features such as:

- **User Profile Information**: Shows this information for the currently logged-in user's profile, including their username and email address.
- **Weather Widget**: Displays current weather information for Toronto such as temperature, conditions, humidity, and wind speed.
- **Data Visualization**: Includes an activity overview chart showing user activities for the past week graphically.
- **Task Management**: Provides functionality for users to create, manage, and organize tasks at different priority levels.
- **Theme Customization**: Comes with the ability to change the dashboard to light, dark, or blue colors.
- **Profile Management**: Allows users to edit their profile information, including username and password modifications.

### Task Management

Using the task management system, users will be able to:
- Add new tasks with different levels of priority assigned, including low, medium, and high.
- Toggle complete and incomplete statuses on tasks
- Remove tasks that are not useful anymore.
- Use different colors to mark different levels of priority/importance for better visibility.

Data pertaining to these tasks are kept in the localStorage of the browser, which means users will still be able to access their data even after closing the application, and do not need an internet connection to a server.

### Theme Settings

Users can customize their dashboard experience by choosing one of the following three theme options:
- Light theme: The background is sharp white, whereas the text is written in dark.
- Dark theme: Dark background for the text is light to reduce strain on the eyes.
- Blue theme: The background is blue, whereas the text color is navy.

Theme preferences are stored in localStorage, so the selected theme is retained between sessions.

## Deployment
The application can be deployed to Vercel. The CMS can be deployed to a hosting provider that supports Node.js applications (e.g., Heroku, DigitalOcean). You will need to configure the environment variables on your hosting platforms.
