const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');

// contextBridge.exposeInMainWorld('electron', {
//   homeDir: () => os.homedir(),
//   osVersion: () => os.arch(),
// });

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
});
contextBridge.exposeInMainWorld('electron', {
    homeDir: () => os.homedir(),
    osVersion: () => os.arch(),
  });
 
contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // Whitelist channels for sending messages to the main process
        let validChannels = ['save-data', 'fetch-data','select-folder','open-project','delete-project','open-database','save-code-data','save-dock-area','remove-dock-area','update-dock-area','register-asset','update-asset','remove-asset','save-ship-project','excel-data-save','update-schedule-table'
    
    ]; // Add 'fetch-data' for reading data 'save-data', 'fetch-data', 
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    
    receive: (channel, func) => {
        // Whitelist channels for receiving messages from the main process
        let validChannels = ['app-id','data-fetched','delete-project-response', 'save-data-response','select-folder-fetched','get-dock-areas','all-dock-areas-fetched','save-dock-area-response','remove-dock-area-response','update-dock-area-response','register-asset-response','all-assets-fetched','update-asset-response','excel-data-saved'
        
        
        ];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
