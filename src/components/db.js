// db.js
import { openDB } from 'idb';

export const initDB = async () => {
  try {
    const database = await openDB("fbx-files-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
    return database;
  } catch (error) {
    console.error("Failed to open or initialize database:", error);
  }
};

export const saveFileMetadata = async (db, fileMetadata) => {
  try {
    await db.put("files", fileMetadata);
  } catch (error) {
    console.error("Failed to save file metadata:", error);
  }
};

export const getFileMetadata = async (db, filename) => {
  try {
    const result = await db.getAllFromIndex("files", "filename", filename);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to retrieve file metadata:", error);
  }
};

export const clearDatabase = async (db) => {
  try {
    const transaction = db.transaction("files", "readwrite");
    const objectStore = transaction.objectStore("files");
    await objectStore.clear();
    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};
