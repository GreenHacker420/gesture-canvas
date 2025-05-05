# Gesture Canvas Art Stream

A hand gesture-based drawing application that allows you to create art using hand movements captured by your webcam. This interactive web application uses TensorFlow.js and MediaPipe for real-time hand tracking.

## Features

- Draw with hand gestures using your webcam
- Support for drawing with both hands simultaneously
- Different gestures for drawing, erasing, changing colors, and clearing the canvas
- Mouse/touch fallback for drawing when hand tracking is unavailable
- Responsive design that works on desktop and mobile devices
- Real-time hand tracking with TensorFlow.js and MediaPipe

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

## Technology Stack

This project is built with modern web technologies:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: shadcn-ui for accessible and customizable components
- **Styling**: Tailwind CSS for utility-first styling
- **Hand Tracking**: TensorFlow.js and MediaPipe for real-time hand pose detection
- **State Management**: React Context API for application state
- **Routing**: React Router for navigation
- **Testing**: React Testing Library for component testing

For more detailed information about the project architecture and implementation, see the [About](ABOUT.md) page.

## Deployment

This project can be deployed on multiple platforms. The repository is private, but the published site is public.

### GitHub Pages

The project is deployed on GitHub Pages. You can access the live version at:
https://greenhacker420.github.io/gesture-canvas/

#### Automatic Deployment (GitHub Actions)

The project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch. The GitHub Actions workflow in `.github/workflows/deploy.yml` handles the build and deployment process.

Key configuration:
- Uses Node.js 20
- Builds with `npm run build:github`
- Creates a `.nojekyll` file to ensure proper asset loading
- Deploys to the `gh-pages` branch

#### Manual Deployment

You can also manually deploy the application to GitHub Pages using the following commands:

```sh
# Build the project for GitHub Pages
npm run build:github

# Deploy to GitHub Pages
npm run deploy
```

### Vercel

The project can also be deployed on Vercel for improved performance and reliability.

#### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the project as a Vite project
3. Set the build command to `npm run build:vercel`
4. Set the output directory to `dist`

The project includes a `vercel.json` configuration file that sets up:
- Proper headers for WASM files
- Cache control for assets
- CORS settings for MediaPipe

#### Manual Deployment

You can manually deploy the application to Vercel using the following commands:

```sh
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod
```

### Netlify

The project can also be deployed on Netlify with full support for MediaPipe.

#### Automatic Deployment

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build:netlify`
3. Set the publish directory to `dist`

The project includes a `netlify.toml` configuration file and custom plugin to ensure:
- Proper handling of MediaPipe WASM files
- Correct CORS headers
- Optimized asset caching

#### Manual Deployment

You can manually deploy the application to Netlify using the following commands:

```sh
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod
```

## Credits and Contributions

Created by GreenHacker

### Libraries and Tools

This project makes use of several open-source libraries and tools:

- [TensorFlow.js](https://www.tensorflow.org/js) for machine learning in the browser
- [MediaPipe](https://mediapipe.dev/) for hand tracking
- [React](https://reactjs.org/) for the user interface
- [Vite](https://vitejs.dev/) for build tooling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
