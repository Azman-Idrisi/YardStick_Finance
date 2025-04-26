# Yardstick - Personal Finance Tracker

A modern personal finance application built with Next.js that helps users track expenses, manage budgets, and gain insights into their spending habits.

## Features

- 📊 Dashboard with visual spending insights
- 💰 Transaction management
- 📅 Budget planning and tracking
- 📈 Visual reports with charts and graphs
- �� Dark mode support
- 🔄 Real-time budget updates
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 14.1.0, React 18.2.0, TypeScript
- **UI Components**: Shadcn UI, Radix UI
- **Forms**: React Hook Form
- **Date Picker**: React Day Picker
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **State Management**: React Context

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- MongoDB connection string

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/yardstick.git
cd yardstick
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your MongoDB connection string:

```env
MONGODB_URI=your_mongodb_connection_string
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js app directory containing routes and components
  - `components/` - Reusable UI components
  - `api/` - API routes for budgets and transactions
  - `lib/` - Database models and utilities
- `components/ui/` - Shadcn UI components
- `public/` - Static assets

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

[MIT](LICENSE)
