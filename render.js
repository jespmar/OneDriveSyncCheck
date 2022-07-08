const { ipcRenderer } = require('electron');

// Renderer process
ipcRenderer.invoke('status', "").then((result) => {
    console.log(result)
  })