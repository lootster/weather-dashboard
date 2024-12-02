# Weather Dashboard Challenge

## Dashboard Challenge Overview

### Scenario
We have an API that provides weather data for the dates from 01 Nov 2024 to 10 Nov 2024. The task is to process this dataset and display it in charts.

### Goal
The goal of this exercise is to create an application that displays the following charts:
- A column chart for relative humidity (`relativehumidity_2m`)
- A line chart for temperature min and max (`temperature_2m_max`, `temperature_2m_min`)
- An area chart for direct radiation (`direct_radiation`)

The application should be written in Angular (preferred) or React with TypeScript.

### Requirements
- Retrieve data from the API:
  - [Open Meteo API](https://api.open-meteo.com/v1/forecast?latitude=1.29&longitude=103.85&hourly=relativehumidity_2m,direct_radiation&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore&start_date=2024-11-01&end_date=2024-11-10)
- Build a single-page application.
- Display all three types of charts.
- Use a simple dashboard layout.

Feel free to use any required libraries.

**Bonus**:
- Store the data in a local SQL database and read from the database in the absence of an internet connection.
- Ensure a responsive design that works on both desktop and mobile views.

## Project Overview

The "Weather Dashboard" is a simple and intuitive single-page application built in React using TypeScript. It presents weather data fetched from an API in three different charts: relative humidity, temperature (min and max), and direct radiation. This project aims to provide an easy-to-understand visual representation of weather data while including a bonus feature of offline storage.

## Key Features

1. **API Fetching**: By default, the application fetches weather data from the Open Meteo API, displaying the information in charts.
2. **Offline Storage (Optional Bonus)**: The application also includes a branch with the ability to store weather data in local SQL (via IndexedDB) for offline access. This allows the app to work seamlessly without internet access.

## Branch Information

- **Main Branch**: Fetches data from the API only.
- **Offline Storage Branch**: Contains the optional offline storage feature. Switch to the `with-offline-storage` branch for offline capability.

## Project Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd weather-dashboard
   ```

2. **Select the Desired Branch**
   - For **default API fetching**, use the main branch:
     ```bash
     git checkout main
     ```
   - For **offline storage support**, use the `with-offline-storage` branch:
     ```bash
     git checkout with-offline-storage
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Application**
   ```bash
   npm start
   ```

5. **View the Application**
   - Open your browser and navigate to `http://localhost:3000`.

### Notes for Running

- By default (main branch), the application will always try to fetch data from the API. 
- The offline storage feature (with-offline-storage branch) allows the application to fall back on local data if there is no network connectivity.

## External Libraries Used

1. **React & React Chart.js**:
   - For building interactive and reusable components and charts.
2. **SQL.js & IndexedDB** (in the `with-offline-storage` branch):
   - Used to provide offline capabilities by storing weather data locally.

## File Structure

```
weather-dashboard/
│
├── public/                  # Public assets folder
│
├── src/                     # Source files
│   ├── components/          # Reusable React components
│   │   ├── AreaChart.tsx
│   │   ├── ColumnChart.tsx
│   │   └── LineChart.tsx
│   │
│   ├── services/            # Services folder for data fetching and database logic
│   │   ├── weatherService.ts
│   │   └── databaseService.ts
│   │
│   ├── App.module.css       # CSS styles for App component
│   ├── App.tsx              # Main App component
│   ├── index.css            # Global CSS styles
│   ├── index.tsx            # Entry point of the React application
│   └── react-app-env.d.ts   # TypeScript environment definitions
│
├── .gitignore               # Ignored files for Git
├── package.json             # Dependencies and project scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Running Tests

This project includes basic unit tests to ensure reliability. Run the tests using the following command:
```bash
npm test
```

## Testing Guidelines
- Run the app in different environments (e.g., with and without network connectivity) to test the offline storage capability.
- Test the charts to ensure the correct data is displayed in the correct format.

## Guidelines for Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the changes and open a Pull Request.
