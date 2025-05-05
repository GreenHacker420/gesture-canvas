# Gesture Canvas Art Stream

A hand gesture-based drawing application that allows you to draw using hand movements captured by your webcam.

## Features

- Draw with hand gestures using your webcam
- Support for drawing with both hands simultaneously
- Different gestures for drawing, erasing, changing colors, and clearing the canvas
- Mouse/touch fallback for drawing when hand tracking is unavailable

## How can I edit this code?

There are several ways of editing your application.

**Development Setup**

This project uses React with TypeScript and TensorFlow.js for hand tracking.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

This project is deployed on GitHub Pages. You can access the live version at:
https://greenhacker420.github.io/gesture-canvas/

### How to deploy

To deploy the application to GitHub Pages, you can use one of the following methods:

#### Automatic Deployment (GitHub Actions)

The project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch. The GitHub Actions workflow handles the build and deployment process.

#### Manual Deployment

You can also manually deploy the application using the following commands:

```sh
# Build the project for GitHub Pages
npm run build:github

# Deploy to GitHub Pages
npm run deploy
```

## Credits

Created by GreenHacker
