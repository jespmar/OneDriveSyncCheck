const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron')

// include the Node.js 'path' module at the top of your file
const path = require('path')

// modify your existing createWindow() function
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

/*   app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  }) */

  let tray

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath('assets/sync3.png')
  tray = new Tray(icon)

  // note: your contextMenu, Tooltip and Title code will go here!

/*   const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  
  tray.setContextMenu(contextMenu) */

  tray.on("click", (event) => {

    createWindow()

  })

  setTimeout(() => {

    let newIcon = nativeImage.createFromPath('assets/sync-problem.png')
    tray.setImage(newIcon)

  }, 5000 )
  
})