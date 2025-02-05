const { app, BrowserWindow, dialog, ipcMain, shell, net, protocol } = require('electron');
const fs = require('fs');
const url = require('url');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const request = require('request-promise-native');
const xlsx = require('xlsx');
const { execFile } = require('child_process');
ipcMain.setMaxListeners(20);
const WebSocket = require('ws');
const startServer = require('./server');
const moment = require('moment');
const { TagFaces } = require('@mui/icons-material');
const dxf = require('dxf');
let mainWindow;
let db;
let selectedFolderPath;
let projectdb
let projectdBPath;
let databasePath
let applicationId

function getApplicationId() {
    const appIdPath = path.join(app.getPath('userData'), 'appId.json');

    if (fs.existsSync(appIdPath)) {
        // Read existing application ID
        const data = fs.readFileSync(appIdPath);
        const appIdData = JSON.parse(data);
        applicationId = appIdData.appId;
        return appIdData.appId;
    } else {
        // Generate a new application ID
        const newAppId = generateCustomID('APPID');
        fs.writeFileSync(appIdPath, JSON.stringify({ appId: newAppId }, null, 2));
        applicationId = newAppId;
        return newAppId;
    }
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Electron App',
        width: 1700,
        height: 800,
        minWidth: 840,
        minHeight: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    const startUrl = url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file',
    });
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.toggleDevTools();
    const appId = getApplicationId();
    console.log('Application ID:', appId);

    // mainWindow.once('ready-to-show', () => {
    //     checkAppValidity();
    //     mainWindow.webContents.send('app-id', appId);
    // });

    // mainWindow.on('closed', () => {
    //     mainWindow = null;
    // });

}
// Your existing event listeners for window-all-closed and activate
function createProjectDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'project.db');
    projectdBPath = dbPath
    projectdb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the database.', dbPath);
            // Create tables if they don't exist
            projectdb.run(`CREATE TABLE IF NOT EXISTS projectdetails (
                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                 projectId TEXT,
                                 projectNumber TEXT,
                                projectName TEXT,
                                 projectDescription TEXT,
                                 projectPath TEXT,
                                 TokenNumber TEXT,
                                 asset TEXT
                             )`);
            projectdb.run(`CREATE TABLE IF NOT EXISTS userdetails (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                username TEXT,
                                password TEXT,
                                email TEXT,
                                registrationDate TEXT,
                                expiryDate TEXT,
                                token TEXT
                            )`);
        }
    });
}
// Function to create or connect to the database in the specified folder
function createDatabase() {
    if (!selectedFolderPath) {
        console.error('No folder selected.');
        return;
    }
    const dbPath = path.join(selectedFolderPath, 'database.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the database.', dbPath);
            db.run("CREATE TABLE IF NOT EXISTS DisciplineTable (discId TEXT,discNo TEXT,discName TEXT)");
            db.run("CREATE TABLE IF NOT EXISTS projectdetails (id INTEGER PRIMARY KEY AUTOINCREMENT,projectId TEXT, projectNumber TEXT, projectName TEXT, projectDescription TEXT,projectPath TEXT, TokenNumber TEXT, asset TEXT)");
            db.run(`
                CREATE TABLE IF NOT EXISTS dock_areas (
                    id TEXT,
                    name TEXT NOT NULL,
                    -- Dimensions
                    width REAL NOT NULL,
                    length REAL NOT NULL,
                    height REAL DEFAULT 0,
                    -- Position
                    pos_x REAL DEFAULT 0,
                    pos_y REAL DEFAULT 0,
                    pos_z REAL DEFAULT 0,
                    -- Rotation
                    rotation_x REAL DEFAULT 0,
                    rotation_y REAL DEFAULT 0,
                    rotation_z REAL DEFAULT 0,
                    -- Translation
                    translation_x REAL DEFAULT 0,
                    translation_y REAL DEFAULT 0,
                    translation_z REAL DEFAULT 0,
                    -- Other fields
                    capacity TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            // Create asset registration table
            db.run(`
                CREATE TABLE IF NOT EXISTS asset_registration (
                    id TEXT PRIMARY KEY,
                    asset_number TEXT UNIQUE NOT NULL,
                    name TEXT,
                    type TEXT,
                    area_id TEXT,
                    -- Dimensions
                    width REAL,
                    length REAL,
                    height REAL,
                    -- Position
                    pos_x REAL DEFAULT 0,
                    pos_y REAL DEFAULT 0,
                    pos_z REAL DEFAULT 0,
                    -- Rotation
                    rotation_x REAL DEFAULT 0,
                    rotation_y REAL DEFAULT 0,
                    rotation_z REAL DEFAULT 0,
                    -- Translation
                    translation_x REAL DEFAULT 0,
                    translation_y REAL DEFAULT 0,
                    translation_z REAL DEFAULT 0,
                    -- Metadata
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (area_id) REFERENCES dock_areas(id)
                )
            `);
            db.run('CREATE TABLE IF NOT EXISTS ShipSchedule (excelId TEXT, projId TEXT, place TEXT, projNo TEXT,planSDate TEXT,planEDate TEXT,startDate TEXT, endDate TEXT, workDays Text, PRIMARY KEY(projId))');

        }
    });
    databasePath = path.join(selectedFolderPath, 'database.db');

}

// Function to prompt the user to select a folder
function selectFolderAndCreateDatabase(event) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        const folderPath = result.filePaths[0];
        if (folderPath) {
            console.log(folderPath)
            selectedFolderPath = folderPath;
            console.log("Sent 'data-fetched' event to renderer process");
            mainWindow.webContents.send('select-folder-fetched', selectedFolderPath);

        }
    }).catch(err => {
        console.error("Error selecting folder:", err);
    });
}
function checkAppValidity() {
    // Fetch user data to check validity
    projectdb.all("SELECT * FROM userdetails", (err, rows) => {
        console.log("enter in to it");
        if (err) {
            console.error('Error fetching data from userdetails table:', err.message);
            return;
        }

        const today = moment();
        console.log("line240", rows);

        if (rows.length > 0) {
            rows.forEach(user => {
                const { expiryDate } = user;
                const expiry = moment(expiryDate);

                if (expiry.isBefore(today)) {
                    // Expiry date has passed
                    console.log("Expiry date has passed")
                    mainWindow.webContents.send('appValidity', {
                        valid: false,
                        message: 'Your access has expired. Please renew your subscription.'
                    });
                } else {
                    // Access is still valid
                    console.log("Access is still valid")

                    mainWindow.webContents.send('appValidity', {
                        valid: true,
                        message: 'Your access is valid.'
                    });
                }
            });
        }
        else {
            console.log("enter validity expired")
            mainWindow.webContents.send('appValidity', {
                valid: false,
                message: 'Your access has expired. Please renew your subscription.'
            });
        }

    });
}

function saveUserDataToDB(userData) {
    const { username, email, password, registrationDate, expiryDate } = userData;

    // Check if the email already exists
    projectdb.get(`SELECT email FROM userdetails WHERE email = ?`, [email], function (err, row) {
        if (err) {
            console.error('Error checking email existence:', err.message);
        } else if (row) {
            // Email already exists
            console.log('Email already exists. User data not saved.');
        } else {
            // Email does not exist, proceed with insertion
            projectdb.run(`INSERT INTO userdetails (username, email, password, registrationDate, expiryDate) VALUES (?, ?, ?, ?, ?)`,
                [username, email, password, registrationDate, expiryDate],
                function (err) {
                    if (err) {
                        console.error('Error inserting user data:', err.message);
                    } else {
                        console.log('User data saved to database.');
                        checkAppValidity();
                    }
                }
            );
        }
    });
}
// Function to save user data to the JSON file
function saveUserDataToJSON(userData) {
    const installDatePath = path.join(app.getPath('userData'), 'userdata.json');

    fs.readFile(installDatePath, (err, data) => {
        let userDataList = [];

        if (!err && data.length > 0) {
            try {
                userDataList = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON data:', parseError.message);
                userDataList = [];
            }
        }

        // Check if the email ID already exists
        const emailExists = userDataList.some(item => item.email === userData.email);

        if (emailExists) {
            console.log('Email ID already exists. Data not saved.');
        } else {
            userDataList.push(userData);
            fs.writeFile(installDatePath, JSON.stringify(userDataList, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to JSON file:', err.message);
                } else {
                    console.log('User data saved to JSON file.');
                }
            });
        }
    });
}

function updateExpiryDateInDB(userData) {
    const { email, expiryDate } = userData;

    projectdb.run(
        `UPDATE userdetails SET expiryDate = ? WHERE email = ?`,
        [expiryDate, email],
        function (err) {
            if (err) {
                console.error('Error updating expiry date in database:', err.message);
            } else if (this.changes === 0) {
                console.log('No user found with the provided email. No update performed.');
            } else {
                console.log('Expiry date updated in database.');
                checkAppValidity();
            }
        }
    );
}

function updateExpiryDateInJSON(userData) {
    const installDatePath = path.join(app.getPath('userData'), 'userdata.json');

    fs.readFile(installDatePath, (err, data) => {
        let userDataList = [];

        if (!err && data.length > 0) {
            try {
                userDataList = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON data:', parseError.message);
                userDataList = [];
            }
        }

        const userIndex = userDataList.findIndex(item => item.email === userData.email);

        if (userIndex !== -1) {
            userDataList[userIndex].expiryDate = userData.expiryDate;
            fs.writeFile(installDatePath, JSON.stringify(userDataList, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to JSON file:', err.message);
                } else {
                    console.log('Expiry date updated in JSON file.');
                }
            });
        } else {
            console.log('User email not found in JSON file.');
        }
    });
}



function deleteProjectDetails(projectNumber) {
    // Check if the projectdb is initialized
    if (!projectdb) {
        console.error('Database not initialized.');
        return;
    }

    // Prepare the SELECT statement to get the project name
    const selectSql = 'SELECT projectName FROM projectdetails WHERE projectId = ?';

    // Execute the SELECT statement
    projectdb.get(selectSql, [projectNumber], (err, row) => {
        if (err) {
            console.error('Error fetching project name:', err.message);
            return;
        }

        // If the project does not exist
        if (!row) {
            console.error('Project not found.');
            return;
        }

        const projectName = row.projectName;
        console.log(projectName);

        // Prepare the DELETE statement
        const deleteSql = 'DELETE FROM projectdetails WHERE projectId = ?';

        // Execute the DELETE statement
        projectdb.run(deleteSql, projectNumber, function (err) {
            if (err) {
                console.error('Error deleting project details:', err.message);
                return;
            }

            // Check how many rows were affected
            console.log(`Rows deleted: ${this.changes}`);

            // Send the response with the project name
            mainWindow.webContents.send('delete-project-response', projectName);
        });
    });
}

function deleteAllProjectDetails() {
    // Check if the projectdb is initialized
    if (!projectdb) {
        console.error('Database not initialized.');
        return;
    }

    // Prepare the DELETE statement to remove all rows from the table
    const deleteSql = 'DELETE FROM projectdetails';

    // Execute the DELETE statement
    projectdb.run(deleteSql, function (err) {
        if (err) {
            console.error('Error deleting all project details:', err.message);
            return;
        }

        // Check how many rows were affected
        console.log(`Rows deleted: ${this.changes}`);

        // Send the response after deletion
        mainWindow.webContents.send('delete-all-project-response');
    });
}

function generateCustomID(prefix) {
    const uuid = uuidv4();
    const uniqueID = prefix + uuid.replace(/-/g, '').slice(0, 6);
    return uniqueID;
}

app.whenReady().then(() => {

    createMainWindow();
    createProjectDatabase();

    ipcMain.on('select-folder', () => {
        console.log("Received 'select-folder' request from renderer process");
        selectFolderAndCreateDatabase();
    });

    ipcMain.on('open-project', (event, projectNumber) => {
        console.log(projectNumber)
        console.log(`Received 'open-project' request for project with ID: ${projectNumber}`);

        // Check if the project database is initialized
        if (!projectdb) {
            console.error('Project database not initialized.');
            return;
        }

        // Query the project database to check if the project with the given ID exists
        projectdb.get('SELECT * FROM projectdetails WHERE projectNumber = ?', projectNumber, (err, row) => {
            if (err) {
                console.error('Error querying project database:', err.message);
                return;
            }

            if (row) {
                console.log(row);
                selectedFolderPath = row.projectPath;
                mainWindow.webContents.send('asset-id-project', row.asset)
                mainWindow.webContents.send('all-project-details', row);
                console.log(`Project path retrieved from database: ${selectedFolderPath}`);

                // Construct the path to the database file
                databasePath = path.join(selectedFolderPath, 'database.db');
                console.log(`Opening database file: ${databasePath}`);

                // Open the database file
                const db = new sqlite3.Database(databasePath, (err) => {
                    if (err) {
                        console.error('Error opening database:', err.message);
                        return;
                    }
                    db.all("SELECT * FROM projectdetails", (err, rows) => {
                        if (err) {
                            console.error('Error fetching data from Tree table:', err.message);
                            return;
                        }
                        console.log("project Details", rows)

                        console.log('Data in the projectdetails table:', rows);
                        // mainWindow.webContents.send('all-area-fetched', rows);
                    });
                    db.all("SELECT * FROM dock_areas", (err, rows) => {
                        if (err) {
                            console.error('Error fetching data from dock_areas table:', err.message);
                            return;
                        }

                        console.log('Data in the Tag table:', rows);
                        mainWindow.webContents.send('all-dock-areas-fetched', rows);
                    });
                    // Fetch all assets and send to frontend

                    db.all("SELECT * FROM asset_registration", (err, rows) => {
                        if (err) {
                            console.error('Error fetching data from asset_registration table:', err.message);
                            return;
                        }
                        mainWindow.webContents.send('all-assets-fetched', rows);
                    });
                    db.all("SELECT * FROM ShipSchedule", (err, rows) => {
                        if (err) {
                            console.error('Error fetching data from Tree table:', err.message);
                            return;
                        }
        
                        console.log('Data in the MtoAreaTagRelTable table:', rows);
                        mainWindow.webContents.send('excel-data-saved', rows);
                    });



                });
            } else {
                console.error(`Project with ID ${projectNumber} not found.`);
            }
        });


    });

    ipcMain.on('fetch-data', (event) => {
        console.log("Received 'fetch-data' request from renderer process");
        if (!projectdb) {
            console.error('Database not initialized.');
            return;
        }
        // Query database for user data
        projectdb.all('SELECT * FROM projectdetails', (err, rows) => {
            if (err) {
                console.error('Error fetching data:', err.message);
                return;
            }
            console.log("Fetched data:", rows);
            // Send fetched data to renderer process
            event.sender.send('data-fetched', rows);
            console.log("Sent 'data-fetched' event to renderer process");
        });
    });

    ipcMain.on('save-data', (event, data) => {
        if (!projectdb) {
            console.error('Database not initialized.');
            return;
        }

        const projectFolderName = data.projectNumber;
        const projectFolderPath = path.join(selectedFolderPath, projectFolderName);
        const projectId = generateCustomID('P');

        try {
            // Create a new folder for the project if it doesn't exist
            if (!fs.existsSync(projectFolderPath)) {
                fs.mkdirSync(projectFolderPath);
                console.log(`Created folder: ${projectFolderPath}`);
            }
            selectedFolderPath = projectFolderPath;

            // Set the database path to the newly created project folder
            const dbPath = path.join(projectFolderPath, 'database.db');
            createDatabase(dbPath);

            // Check if projectNumber already exists in the database
            projectdb.get('SELECT projectId FROM projectdetails WHERE projectNumber = ?', [data.projectNumber], (err, row) => {
                if (err) {
                    console.error('Error checking project number:', err.message);
                    event.reply('save-data-response', { success: false, message: 'Error saving project' });
                    return;
                }

                if (row) {
                    // Project number already exists
                    mainWindow.webContents.send('save-data-response', { success: false, message: 'Project number already exists' });
                    console.log('Project number already exists');
                    return;
                }

                // Insert project details into the database
                projectdb.run(
                    `INSERT INTO projectdetails (projectId, projectNumber, projectName, projectDescription, projectPath) VALUES (?, ?, ?, ?, ?)`,
                    [projectId, data.projectNumber, data.projectName, data.projectDescription, selectedFolderPath],
                    function (err) {
                        if (err) {
                            console.error('Error inserting data:', err.message);
                            event.reply('save-data-response', { success: false, message: 'Error inserting data into database' });
                        } else {
                            console.log(`Row inserted with ID: ${this.lastID}`);
                            mainWindow.webContents.send('save-data-response', {
                                success: true,
                                message: 'Project saved successfully',
                                project: {
                                    projectId: projectId,
                                    projectNumber: data.projectNumber,
                                    projectName: data.projectName,
                                    projectDescription: data.projectDescription,
                                    projectPath: selectedFolderPath
                                }
                            });

                            const projectDetails = {
                                projectId: projectId,
                                projectNumber: data.projectNumber,
                                projectName: data.projectName,
                                projectDescription: data.projectDescription,
                                projectPath: selectedFolderPath
                            };

                            const jsonFilePath = path.join(projectFolderPath, 'project_details.json');
                            fs.writeFileSync(jsonFilePath, JSON.stringify(projectDetails, null, 2));
                            console.log(`Project details written to: ${jsonFilePath}`);

                            initializeProjectDatabase(dbPath, mainWindow);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error in save-data handler:', error);
            event.reply('save-data-response', { success: false, message: 'Error saving project' });
        }
    });

    function initializeProjectDatabase(databasePath, mainWindow) {
        const projectDb = new sqlite3.Database(databasePath, async (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                return;
            }
            console.log("databasePath", databasePath);

            const statuses = [
                { number: '1', statusname: 'open', color: '#ff0000' },
                { number: '2', statusname: 'closed', color: '#00ff00' }
            ];

            const userDefinedFields = Array.from({ length: 50 }, (_, i) => ({
                taginfo: `Taginfo${i + 1}`,
                taginfounit: `Taginfounit${i + 1}`,
                tagcheck: 'checked'
            }));

            const runQuery = (query, params = []) => {
                return new Promise((resolve, reject) => {
                    projectDb.run(query, params, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            };

            const selectQuery = (query) => {
                return new Promise((resolve, reject) => {
                    projectDb.all(query, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
            };

            try {
                for (let status of statuses) {
                    await runQuery(`INSERT OR IGNORE INTO CommentStatus (number, statusname, color) VALUES (?, ?, ?)`, [status.number, status.statusname, status.color]);
                }

                let allStatuses = await selectQuery("SELECT * FROM CommentStatus");
                mainWindow.webContents.send('all-status', allStatuses);

                for (let { taginfo, taginfounit, tagcheck } of userDefinedFields) {

                    // Insert into UserTagInfoFieldUnits table
                    await runQuery(
                        `INSERT OR IGNORE INTO UserTagInfoFieldUnits (field, unit,statuscheck) VALUES (?, ?,?)`,
                        [taginfo, taginfounit, tagcheck]
                    );
                }

                // Retrieve all inserted fields
                let allUserDefinedFields = await selectQuery("SELECT * FROM UserTagInfoFieldUnits");
                mainWindow.webContents.send('all-fields-user-defined', allUserDefinedFields);

            } catch (error) {
                console.error('Error:', error.message);
            }
        });
    }

    async function getDockArea(id) {
        try {
            return await db.get('SELECT * FROM dock_areas WHERE id = ?', id);
        } catch (error) {
            console.error('Error getting dock area:', error);
            throw error;
        }
    }

    async function updateDockArea(id, dockData) {
        try {
            const result = await db.run(`
                UPDATE dock_areas 
                SET name = ?, 
                    width = ?, length = ?, height = ?,
                    pos_x = ?, pos_y = ?, pos_z = ?,
                    rotation_x = ?, rotation_y = ?, rotation_z = ?,
                    translation_x = ?, translation_y = ?, translation_z = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                dockData.name,
                dockData.width,
                dockData.length,
                dockData.height || 0,
                dockData.posX || 0,
                dockData.posY || 0,
                dockData.posZ || 0,
                dockData.rotationX || 0,
                dockData.rotationY || 0,
                dockData.rotationZ || 0,
                dockData.translationX || 0,
                dockData.translationY || 0,
                dockData.translationZ || 0,
                id
            ]);

            if (result.changes > 0) {
                return await getDockArea(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating dock area:', error);
            throw error;
        }
    }


    function deleteProjectDetails(projectNumber) {
        // Check if the projectdb is initialized
        if (!projectdb) {
            console.error('Database not initialized.');
            return;
        }

        // Prepare the SELECT statement to get the project name
        const selectSql = 'SELECT projectName FROM projectdetails WHERE projectId = ?';

        // Execute the SELECT statement
        projectdb.get(selectSql, [projectNumber], (err, row) => {
            if (err) {
                console.error('Error fetching project name:', err.message);
                return;
            }

            // If the project does not exist
            if (!row) {
                console.error('Project not found.');
                return;
            }

            const projectName = row.projectName;
            console.log(projectName);

            // Prepare the DELETE statement
            const deleteSql = 'DELETE FROM projectdetails WHERE projectId = ?';

            // Execute the DELETE statement
            projectdb.run(deleteSql, projectNumber, function (err) {
                if (err) {
                    console.error('Error deleting project details:', err.message);
                    return;
                }

                // Check how many rows were affected
                console.log(`Rows deleted: ${this.changes}`);

                // Send the response with the project name
                mainWindow.webContents.send('delete-project-response', projectName);
            });
        });
    }

    function deleteAllProjectDetails() {
        // Check if the projectdb is initialized
        if (!projectdb) {
            console.error('Database not initialized.');
            return;
        }

        // Prepare the DELETE statement to remove all rows from the table
        const deleteSql = 'DELETE FROM projectdetails';

        // Execute the DELETE statement
        projectdb.run(deleteSql, function (err) {
            if (err) {
                console.error('Error deleting all project details:', err.message);
                return;
            }

            // Check how many rows were affected
            console.log(`Rows deleted: ${this.changes}`);

            // Send the response after deletion
            mainWindow.webContents.send('delete-all-project-response');
        });
    }


    ipcMain.on('delete-all-project', (event,) => {
        console.log("receive delete message")
        if (!projectdb) {
            console.error('Project database not initialized.');
            return;
        }
        deleteAllProjectDetails();

    });

    ipcMain.on('delete-project', (event, projectNumber) => {
        console.log("receive delete message")

        // Check if the project database is initialized
        if (!projectdb) {
            console.error('Project database not initialized.');
            return;
        }
        deleteProjectDetails(projectNumber);

    });

    // Handle saving new dock area
    ipcMain.on('save-dock-area', async (event, dockData) => {
        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }

        const Id = generateCustomID('A');
        const projectDb = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                return;
            }

            projectDb.run(`
                    INSERT INTO dock_areas (
                        id, name, 
                        width, length, height,
                        pos_x, pos_y, pos_z,
                        rotation_x, rotation_y, rotation_z,
                        translation_x, translation_y, translation_z
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                Id,
                dockData.name,
                dockData.width,
                dockData.length,
                dockData.height || 0,
                dockData.posX || 0,
                dockData.posY || 0,
                dockData.posZ || 0,
                dockData.rotationX || 0,
                dockData.rotationY || 0,
                dockData.rotationZ || 0,
                dockData.translationX || 0,
                dockData.translationY || 0,
                dockData.translationZ || 0
            ], (err) => {
                if (err) {
                    console.error('Error inserting dock area:', err);
                    event.reply('save-dock-area-response', {
                        success: false,
                        message: 'Error saving dock area'
                    });
                    return;
                }

                // Fetch and send updated dock areas
                projectDb.all("SELECT * FROM dock_areas", (err, rows) => {
                    if (err) {
                        console.error('Error fetching dock areas:', err.message);
                        return;
                    }
                    console.log('Updated dock areas:', rows);
                    mainWindow.webContents.send('all-dock-areas-fetched', rows);
                });
            });
        });
    });

    // Handle updating dock area
    ipcMain.on('update-dock-area', async (event, dockData) => {
        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }
        console.log(dockData)

        const projectDb = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                event.reply('update-dock-area-response', {
                    success: false,
                    message: 'Error connecting to database'
                });
                return;
            }

            projectDb.run(`
            UPDATE dock_areas SET 
                name = ?,
                width = ?,
                length = ?,
                height = ?,
                pos_x = ?,
                pos_y = ?,
                pos_z = ?,
                rotation_x = ?,
                rotation_y = ?,
                rotation_z = ?,
                translation_x = ?,
                translation_y = ?,
                translation_z = ?
            WHERE id = ?
        `, [
                dockData.name,
                dockData.width,
                dockData.length,
                dockData.height || 0,
                dockData.pos_x || 0,
                dockData.pos_y || 0,
                dockData.pos_z || 0,
                dockData.rotation_x || 0,
                dockData.rotation_y || 0,
                dockData.rotation_z || 0,
                dockData.translation_x || 0,
                dockData.translation_y || 0,
                dockData.translation_z || 0,
                dockData.id
            ], function (err) {
                if (err) {
                    console.error('Error updating dock area:', err);
                    event.reply('update-dock-area-response', {
                        success: false,
                        message: 'Error updating dock area'
                    });
                    return;
                }

                // Check if any row was actually updated
                if (this.changes === 0) {
                    event.reply('update-dock-area-response', {
                        success: false,
                        message: 'No dock area found with the specified ID'
                    });
                    return;
                }

                // Fetch and send updated dock areas
                projectDb.all("SELECT * FROM dock_areas", (err, rows) => {
                    if (err) {
                        console.error('Error fetching dock areas:', err.message);
                        return;
                    }
                    console.log('Updated dock areas:', rows);
                    mainWindow.webContents.send('all-dock-areas-fetched', rows);
                });
                console.log("ly")
                // Send success response
                event.reply('update-dock-area-response', {
                    success: true,
                    message: 'Dock area updated successfully'
                });
            });

        });
    });

    // Handle deleting dock area
    ipcMain.on('remove-dock-area', async (event, id) => {
        console.log(id);

        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }

        const projectDb = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                return;
            }
            // Delete the row with the given tagId
            projectDb.run('DELETE FROM dock_areas WHERE id = ? ', [id], function (err) {
                if (err) {
                    console.error('Error deleting data:', err.message);
                    return;
                }
                console.log(`Row with Id ${id} deleted successfully.`);
                mainWindow.webContents.send('remove-dock-area-response');
                projectDb.all("SELECT * FROM dock_areas", (err, rows) => {
                    if (err) {
                        console.error('Error fetching data from dock_areas table:', err.message);
                        return;
                    }
                    mainWindow.webContents.send('all-dock-areas-fetched', rows);
                });

            });
        })

    });

    // Register new asset
    ipcMain.on('register-asset', async (event, assetData) => {
        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }

        const projectDb = new sqlite3.Database(databasePath, async (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                event.reply('register-asset-response', {
                    success: false,
                    message: 'Database connection error'
                });
                return;
            }

            try {
                // Check if asset number already exists
                const existingAsset = await new Promise((resolve, reject) => {
                    projectDb.get('SELECT asset_number FROM asset_registration WHERE asset_number = ?',
                        [assetData.number], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                });

                if (existingAsset) {
                    event.reply('register-asset-response', {
                        success: false,
                        message: 'Asset number already exists'
                    });
                    return;
                }

                const assetId = generateCustomID('AST'); // Assuming you have this function

                // Insert new asset
                await new Promise((resolve, reject) => {
                    projectDb.run(`
                    INSERT INTO asset_registration (
                        id, asset_number, name, type, area_id,
                        width, length, height,
                        pos_x, pos_y, pos_z,
                        rotation_x, rotation_y, rotation_z,
                        translation_x, translation_y, translation_z
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                        assetId,
                        assetData.number,
                        assetData.name,
                        assetData.type,
                        assetData.area,
                        assetData.width || 0,
                        assetData.length || 0,
                        assetData.height || 0,
                        assetData.posX || 0,
                        assetData.posY || 0,
                        assetData.posZ || 0,
                        assetData.rotationX || 0,
                        assetData.rotationY || 0,
                        assetData.rotationZ || 0,
                        assetData.translationX || 0,
                        assetData.translationY || 0,
                        assetData.translationZ || 0
                    ], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Fetch all assets and send to frontend
                const assets = await new Promise((resolve, reject) => {
                    projectDb.all("SELECT * FROM asset_registration", (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });

                mainWindow.webContents.send('all-assets-fetched', assets);
                event.reply('register-asset-response', {
                    success: true,
                    message: 'Asset registered successfully'
                });

            } catch (error) {
                console.error('Error registering asset:', error);
                event.reply('register-asset-response', {
                    success: false,
                    message: 'Error registering asset'
                });
            }
        });
    });

    ipcMain.on('update-asset', async (event, assetData) => {
        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }
        console.log(assetData)

        const projectDb = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                event.reply('update-dock-area-response', {
                    success: false,
                    message: 'Error connecting to database'
                });
                return;
            }
            projectDb.run(`
        UPDATE asset_registration SET 
            name = ?,
                         type = ?,
                         area_id = ?,
                         width = ?,
                         length = ?,
                         height = ?,
                         pos_x = ?,
                         pos_y = ?,
                         pos_z = ?,
                         rotation_x = ?,
                         rotation_y = ?,
                         rotation_z = ?,
                         translation_x = ?,
                        translation_y = ?,
                         translation_z = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?
    `, [
                assetData.name,
                assetData.type,
                assetData.area_id,
                assetData.width || 0,
                assetData.length || 0,
                assetData.height || 0,
                assetData.pos_x || 0,
                assetData.pos_y || 0,
                assetData.pos_z || 0,
                assetData.rotation_x || 0,
                assetData.rotation_y || 0,
                assetData.rotation_z || 0,
                assetData.translation_x || 0,
                assetData.translation_y || 0,
                assetData.translation_z || 0,
                assetData.id
            ], function (err) {
                if (err) {
                    console.error('Error updating dock area:', err);
                    event.reply('update-asset-response', {
                        success: false,
                        message: 'Error updating dock area'
                    });
                    return;
                }

                // Check if any row was actually updated
                if (this.changes === 0) {
                    event.reply('update-asset-response', {
                        success: false,
                        message: 'No dock area found with the specified ID'
                    });
                    return;
                }

                // Fetch and send updated dock areas
                projectDb.all("SELECT * FROM asset_registration", (err, rows) => {
                    if (err) {
                        console.error('Error fetching assets:', err.message);
                        return;
                    }
                    console.log('Updated assets :', rows);
                    mainWindow.webContents.send('all-assets-fetched', rows);
                });
                // Send success response
                event.reply('update-asset-response', {
                    success: true,
                    message: 'Assets are updated successfully'
                });
            });

        });
    });

    // Delete asset
    ipcMain.on('remove-asset', async (event, assetId) => {
        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }

        const projectDb = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                return;
            }
            // Delete the row with the given tagId
            projectDb.run('DELETE FROM asset_registration WHERE id = ? ', [assetId], function (err) {
                if (err) {
                    console.error('Error deleting data:', err.message);
                    return;
                }
                console.log(`Row with Id ${assetId} deleted successfully.`);
                mainWindow.webContents.send('delete-asset-response');
                projectDb.all("SELECT * FROM asset_registration", (err, rows) => {
                    if (err) {
                        console.error('Error fetching data from dock_areas table:', err.message);
                        return;
                    }
                    mainWindow.webContents.send('all-assets-fetched', rows);
                });

            });
        })
    });

    ipcMain.on('excel-data-save', (event, data) => {

        if (!databasePath) {
            console.error('Project database path not available.');
            return;
        }

        const projectDb = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening project database:', err.message);
                return;
            }

            // const Mto_DocID = generateCustomID('Md');

            projectDb.run(
                'INSERT INTO ShipSchedule (excelId ,projId ,place ,projNo ,planSDate ,planEDate ,startDate ,endDate ,workDays ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [data.excelId, data.projId, data.place, data.projNo, data.planSDate, data.planEDate, data.startDate, data.endDate, data.workDays],
                function (err) {
                    if (err) {
                        console.error('Error inserting into ShipSchedule:', err.message);
                        return;
                    }
                    console.log(`Row inserted with projNo: ${data.projNo}`);
                }

            );
            projectDb.all("SELECT * FROM ShipSchedule", (err, rows) => {
                if (err) {
                    console.error('Error fetching data from Tree table:', err.message);
                    return;
                }

                console.log('Data in the MtoAreaTagRelTable table:', rows);
                mainWindow.webContents.send('excel-data-saved', rows);
            });
        })

    })


})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

