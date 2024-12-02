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

    createWeatherTable(db);
    return db;
};

// Create a table for storing weather data
const createWeatherTable = (db: Database) => {
    db.run(`
    CREATE TABLE IF NOT EXISTS weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      humidity INTEGER,
      max_temp INTEGER,
      min_temp INTEGER,
      radiation INTEGER,
      daily_time TEXT
    )
  `);
};

// Insert weather data into the database and persist it
export const saveWeatherData = async (data: any) => {
    if (!db) {
        throw new Error("Database is not initialized");
    }

    console.log("saveWeatherData: Saving the following data to IndexedDB:", data);
    const insertStmt = `
    INSERT INTO weather_data (time, humidity, max_temp, min_temp, radiation, daily_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    data.hourly.time.forEach((time: string, index: number) => {
        const hourlyTime = data.hourly.time[index % data.hourly.time.length];
        const humidity = data.hourly.relativehumidity_2m[index];
        const radiation = data.hourly.direct_radiation[index];
        const maxTemp = data.daily.temperature_2m_max[index % data.daily.temperature_2m_max.length];
        const minTemp = data.daily.temperature_2m_min[index % data.daily.temperature_2m_min.length];
        const dailyTime = data.daily.time[index % data.daily.time.length];


        db!.run(insertStmt, [hourlyTime, humidity, maxTemp, minTemp, radiation, dailyTime]);
    });

    await persistDatabase(); // Save the database state to IndexedDB
    console.log("saveWeatherData: Data saved to IndexedDB successfully.");
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
        console.error("Database is not initialized in getOfflineWeatherData()");
        throw new Error("Database is not initialized");
    }

    const results = db.exec(`
    SELECT * FROM weather_data
  `);

    if (results.length === 0) {
        console.log("getOfflineWeatherData: No data found in the weather_data table.");
        return null;
    }

    console.log("Query Result", results);

    const rows = results[0].values;

    // Convert rows to suitable object
    const data = {
        hourly: {
            time: rows.map((row) => row[1]),
            relativehumidity_2m: rows.map((row) => row[2]),
            direct_radiation: rows.map((row) => row[5]),
        },
        daily: {
            time: rows.map((row) => row[6]), // Fetching the daily time from the 7th column
            temperature_2m_max: rows.map((row) => row[3]),
            temperature_2m_min: rows.map((row) => row[4]),
        },
    };

    return data;
};

// Debugging function to check the contents of weather_data
export const checkWeatherDataTable = () => {
    if (!db) {
        console.error("Database is not initialized");
        return;
    }

    const results = db.exec(`
    SELECT * FROM weather_data
  `);

    if (results.length === 0) {
        console.log("checkWeatherDataTable: No data found in the weather_data table.");
    } else {
        console.log("checkWeatherDataTable: Data found in weather_data table:", results[0].values);
    }
};
