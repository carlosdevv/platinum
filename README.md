# Game Platinum Tracker Documentation

## Overview

Game Platinum Tracker is a personal application developed to manage and track games that have been "platinumed" (completed with 100% of achievements) across different platforms. This project was born from a passion for exploring games in their entirety, seeking to complete all available challenges and achievements on both PlayStation 5 and PC.

## Purpose

As a gaming enthusiast who enjoys challenging myself and getting the most out of each gaming experience, I needed a centralized tool to manage achievements across multiple platforms. Game Platinum Tracker solves this problem by offering:

- Unified registry of platinumed games across different platforms
- Quick visualization of achievement history
- Organization of game collection by platform, genre, and status
- Progress tracking for current games

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js with Google Provider
- **Database**: Prisma ORM
- **Styling**: Tailwind CSS

## Main Features

- **Secure Authentication**: Google login to protect personal data
- **Game Registration**: Add new games to the collection with details such as title, platform, and completion date
- **Advanced Filtering**: Search games by platform, platinum status, genre, or name
- **Statistics**: Visualization of data about the platinumed game collection
- **Responsiveness**: Adaptable interface for use on mobile and desktop devices

## Project Structure
src/
├── app/ # Routes and pages of the application
│ ├── api/ # Next.js API Routes
│ │ ├── auth/ # Authentication endpoints
│ │ └── games/ # Game management endpoints
├── components/ # Reusable React components
│ ├── card-game/ # Game display component
│ ├── menu/ # Application navigation
│ └── modals/ # User interaction modals
├── context/ # React contexts for state management
├── lib/ # Utilities and configurations
│ ├── auth.ts # NextAuth configuration
│ └── prismadb.ts # Prisma client for database acces


## Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- NPM or Yarn
- Google account for OAuth authentication

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:
DATABASE_URL="your_database_connection_url"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXTAUTH_SECRET="nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"


### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/game-platinum-tracker.git
   cd game-platinum-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at `http://localhost:3000`

## Deployment

The application is configured for deployment on Vercel, leveraging the native integration with Next.js. The CI/CD process ensures that each commit to the main branch is automatically deployed after passing all tests.

## Contribution

This is a personal project, but suggestions and improvements are always welcome. Feel free to open issues or submit pull requests.

## Future Improvements

- Integration with PlayStation Network and Steam APIs for automatic achievement import
- Notification system to remind of in-progress games
- Offline mode for access without internet
- Social sharing of achievements

---

Developed with ❤️ to manage the passion for completing games to their fullest.
