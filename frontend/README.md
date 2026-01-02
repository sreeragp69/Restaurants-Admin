# Restaurant Admin Dashboard

A comprehensive admin dashboard for managing restaurant operations, built with React, TypeScript, and Tailwind CSS.

## Overview

This Restaurant Admin Dashboard provides a complete solution for restaurant management, including menu management, order tracking, staff management, analytics, and more. It's built with modern web technologies to ensure a smooth and efficient user experience.

## Features

- 🍽️ **Menu Management** - Create, update, and organize menu items and categories
- 📊 **Order Management** - Track and manage orders in real-time
- 👥 **Staff Management** - Manage staff members, roles, and permissions
- 📈 **Analytics Dashboard** - View sales reports, popular items, and business insights
- 🎨 **Modern UI** - Beautiful, responsive interface with dark mode support
- 🔐 **Authentication** - Secure login and role-based access control
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks & Context API
- **Routing**: React Router
- **Charts**: ApexCharts
- **Build Tool**: Vite

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or later (Node.js 20.x or later recommended)
- npm or yarn package manager

## Installation

1. **Clone the repository** (if not already cloned):

   ```bash
   git clone <your-repository-url>
   cd "Restaurent Admin/frontend"
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── layouts/        # Layout components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

This frontend is designed to work with the Restaurant Admin backend API. Make sure the backend server is running and configured with the correct API endpoints.

### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
# Add other environment variables as needed
```

## Features in Detail

### Dashboard
- Overview of key metrics and statistics
- Recent orders and activity feed
- Quick access to common tasks

### Menu Management
- Add, edit, and delete menu items
- Organize items by categories
- Set prices and availability
- Upload item images

### Order Management
- View all orders in real-time
- Filter by status, date, or customer
- Update order status
- Print receipts

### Staff Management
- Add and manage staff members
- Assign roles and permissions
- Track staff activity

### Analytics
- Sales reports and trends
- Popular items analysis
- Revenue tracking
- Customer insights

## Development

### Adding New Features

1. Create components in the `src/components/` directory
2. Add pages in the `src/pages/` directory
3. Update routing in the main router file
4. Add types in `src/types/` if needed

### Styling

This project uses Tailwind CSS for styling. You can customize the theme by modifying the Tailwind configuration file.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components inspired by modern admin dashboard designs
