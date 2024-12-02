import initSqlJs, { Database } from "sql.js";

const DB_NAME = "weather_db";
const STORE_NAME = "databases";
let db: Database | null = null;

// Initialize SQL.js and create the database instance
export const initializeDatabase = async () => {
    if (db) return db;

    const SQL = await initSqlJs({
        locateFile: (file) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`,
    });

    // Load persisted data from IndexedDB if available
    const dbContent = await getPersistedDB();
    db = dbContent ? new SQL.Database(new Uint8Array(dbContent)) : new SQL.Database();

    createWeatherTables(db);
    return db;
};

// Create 2 tables for storing weather data
const createWeatherTables = (db: Database) => {
    db.run(`
    CREATE TABLE IF NOT EXISTS weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      humidity INTEGER,
      radiation INTEGER,
      max_temp INTEGER,
      min_temp INTEGER
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS daily_weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      max_temp INTEGER,
      min_temp INTEGER
    )
  `);
};


// Insert weather data into the database and persist it
export const saveWeatherData = async (data: any) => {
    if (!db) {
        throw new Error("Database is not initialized");
    }

    // Insert statement for hourly data
    const insertHourlyStmt = `
    INSERT INTO weather_data (time, humidity, radiation, max_temp, min_temp)
    VALUES (?, ?, ?, ?, ?)
  `;

    // Insert statement for daily data
    const insertDailyStmt = `
    INSERT INTO daily_weather_data (time, max_temp, min_temp)
    VALUES (?, ?, ?)
  `;

    // Insert hourly data into weather_data table
    data.hourly.time.forEach((time: string, index: number) => {
        const humidity = data.hourly.relativehumidity_2m[index];
        const radiation = data.hourly.direct_radiation[index];
        const maxTemp = data.daily.temperature_2m_max[index % data.daily.temperature_2m_max.length];
        const minTemp = data.daily.temperature_2m_min[index % data.daily.temperature_2m_min.length];

        db!.run(insertHourlyStmt, [time, humidity, radiation, maxTemp, minTemp]);
    });

    // Insert daily data into daily_weather_data table
    data.daily.time.forEach((time: string, index: number) => {
        const maxTemp = data.daily.temperature_2m_max[index];
        const minTemp = data.daily.temperature_2m_min[index];

        db!.run(insertDailyStmt, [time, maxTemp, minTemp]);
    });

    await persistDatabase(); // Save the database state to IndexedDB
};

// Persist the database to IndexedDB
const persistDatabase = async () => {
    if (!db) return;

    console.log("Database ready for export. Attempting to persist...");
    const dbData = db.export();
    console.log("Database data to be persisted:", dbData);

    const blob = new Blob([dbData], { type: "application/octet-stream" });

    const request = indexedDB.open(DB_NAME, 2);

    return new Promise<void>((resolve, reject) => {
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                console.log("Creating object store...");
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const putRequest = store.put(blob, "weather");

            putRequest.onsuccess = () => {
                console.log("Weather data persisted successfully.");
                console.log("Data stored in IndexedDB successfully:", dbData);
                resolve();
            };

            putRequest.onerror = (event) => {
                console.error("Failed to save data:", (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        };

        request.onerror = (event) => {
            console.error("Failed to open IndexedDB:", (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

// Retrieve the persisted database from IndexedDB
const getPersistedDB = (): Promise<ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                console.log("Creating object store in getPersistedDB...");
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            console.log("IndexedDB opened successfully in getPersistedDB.");
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(STORE_NAME, "readonly");
            const getRequest = transaction.objectStore(STORE_NAME).get("weather");

            getRequest.onsuccess = (event) => {
                console.log("getPersistedDB: Successfully retrieved the Blob from IndexedDB.");
                const result = (event.target as IDBRequest).result;

                if (result) {
                    console.log("getPersistedDB: Blob found, converting to ArrayBuffer...");
                    // Convert Blob to ArrayBuffer
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        console.log("getPersistedDB: Successfully converted Blob to ArrayBuffer.");
                        resolve(e.target?.result as ArrayBuffer);
                    };
                    reader.onerror = (e) => {
                        console.error("getPersistedDB: Failed to convert Blob to ArrayBuffer.", e);
                        reject(e);
                    };
                    reader.readAsArrayBuffer(result);
                } else {
                    console.log("getPersistedDB: No data found in IndexedDB.");
                    resolve(null);
                }
            };

            getRequest.onerror = (event) => {
                console.error("Error retrieving persisted database:", (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        };

        request.onerror = (event) => {
            console.error("Failed to open IndexedDB:", (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};


// Retrieve weather data from the database
export const getOfflineWeatherData = (): any => {
    if (!db) {
        throw new Error("Database is not initialized");
    }

    // Fetch hourly data
    const hourlyResults = db.exec(`
    SELECT * FROM weather_data
  `);

    // Fetch daily data
    const dailyResults = db.exec(`
    SELECT * FROM daily_weather_data
  `);

    if (hourlyResults.length === 0 || dailyResults.length === 0) {
        return null;
    }

    const hourlyRows = hourlyResults[0].values;
    const dailyRows = dailyResults[0].values;

    // Convert rows to suitable object
    const data = {
        hourly: {
            time: hourlyRows.map((row) => row[1]),
            relativehumidity_2m: hourlyRows.map((row) => row[2]),
            direct_radiation: hourlyRows.map((row) => row[3]),
        },
        daily: {
            time: dailyRows.map((row) => row[1]),
            temperature_2m_max: dailyRows.map((row) => row[2]),
            temperature_2m_min: dailyRows.map((row) => row[3]),
        }
    };

    return data;
};
