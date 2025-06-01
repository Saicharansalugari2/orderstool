
# orderstool

Built by Saicharan Salugari

I built this Orderstool it is a full-stack Next.js application for managing and reporting on orders. It provides:

## Order Management

1.Create, view, edit, and delete orders via a rich form

2.Track order lines, amounts, status, shipping details, etc.

3.Keep data synchronized with  Next.js API  and Redux Toolkit for state management

## Dashboard & Reporting

4.Summary cards showing total orders, revenue, counts by status

5.Bar chart of total order amount by customer

6.Pie chart and detailed statistics breakdown by order status

## Export Functionality

7.Export orders to CSV via a button 

## Modern UI

8.Styled with Material UI (MUI v5) components and theming

9.Responsive design for desktop and optmized for mobile

10.Dark‐themed, glassmorphic panels, charts, and hover animations

## TypeScript Everywhere

11.Fully typed components, Redux slices, thunks, and utilities

12.Compile‐time safety for API shapes, order types, and chart data

=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).


### Core Technologies
- Framework : Next.js 14.1.0 (React Framework)
- Language : TypeScript 5.3.3
- UI Library : React 18.2.0
- Styling : 
  - TailwindCSS 3.4.17
  - Material-UI (MUI) v5

### Major Dependencies

1. UI Components & Design 
   - `@mui/material` v5.15.14 - Core Material-UI components
   - `@mui/icons-material` v5.17.1 - Material Icons
   - `@mui/lab` - Advanced MUI components
   - `@mui/x-date-pickers` - Date/Time pickers
   - `@emotion/react` & `@emotion/styled` - CSS-in-JS styling
   - TailwindCSS with forms plugin

2. State Management
   - `@reduxjs/toolkit` v2.8.2 - Redux state management
   - `react-redux` v9.2.0 - React bindings for Redux
   - `redux-persist` v6.0.0 - State persistence

3. Data Visualization
   - `chart.js` v4.4.9 - Chart library
   - `react-chartjs-2` v5.3.0 - React wrapper for Chart.js
   - `recharts` v2.15.3 - Alternative charting library
   - `@mui/x-charts` - MUI's charting solution

4. Forms & Data Handling
   - `react-hook-form` v7.50.0 - Form handling
   - `date-fns` v2.30.0 - Date manipulation
   - `papaparse` v5.4.1 - CSV parsing

5. Development Tools
   - `eslint` v8.57.0 - Code linting
   - `typescript` v5.3.3 - TypeScript compiler
   - `autoprefixer` v10.4.21 - CSS post-processing
   - `postcss` v8.5.4 - CSS transformation

### TypeScript Configuration
- Strict mode enabled
- ES5 target with ESNext features
- Path aliases configured (`@/*` → `./src/*`)
- JSX preservation for Next.js
- Module resolution set to "bundler"

### Development Scripts
- `npm run dev` - Development server


This is a modern, full-stack TypeScript application with a robust set of tools for UI development, state management, and data visualization. The combination of Next.js, TypeScript, MUI, and Redux provides a solid foundation for building scalable web applications.


## Prerequisites

You need to have the following installed before proceeding:

Node.js (v18 or later)


# Navigate to your desired parent directory
cd ~/Development

# Clone the repo from GitHub
git clone https://github.com/Saicharansalugari2/orderstool.git

# Enter the project folder
cd orderstool

# Install Dependencies

Important: If you encounter any peer‐dependency or version conflicts (especially with MUI), see the “Troubleshooting” section below.

 Using npm

bash

## npm install

This reads package.json and installs all required packages:

React, Next.js, Redux Toolkit, MUI, Chart.js, etc.

It also generates (or updates) package-lock.json.

## Run in Development Mode

Start the Next.js dev server:

bash

npm run dev

(or yarn dev)

Next.js compiles in watch mode.

Open your browser and navigate to http://localhost:3000.



.




