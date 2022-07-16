const { app, BrowserWindow, Tray, Menu, nativeImage, dialog, ipcMain } = require('electron')
const os = require("os");
const fs = require("fs")

const syncCheck = require("./helpers/syncChecker")

app.disableHardwareAcceleration()

console.log(app.getPath('userData'))

// include the Node.js 'path' module at the top of your file
const path = require('path')


let win
let dialogWin


// modify your existing createWindow() function
const createWindow = (cursor) => {

  const height = 600
  const width = 374

   win = new BrowserWindow({
    show: false,
    width,
    height,
    x: cursor.x - (width / 2),
    y: cursor.y - height - 30,
    titleBarStyle: "hidden",
    titleBarOverlay: false,
    webPreferences: {
      preload: path.join(__dirname, 'views', 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
    }
  })

  win.loadFile('views/main/main.view.html')

}


const createDialogWindow = (cursor) => {

  const height = 300
  const width = 600

   dialogWin = new BrowserWindow({
    width,
    height,
    maximizable: false,
    minimizable: false,
    thickFrame: true,
    resizable: false,
    frame: false,
    titleBarStyle: "hidden",
    alwaysOnTop: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
  })

  dialogWin.loadFile('views/dialog/dialog.view.html')
}

console.log(process.platform)

  app.on('window-all-closed', () => {
    if (process.platform !== 'win32') app.quit()
  })

/*   app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  }) */

  let tray

  let allTenants

  const getStatus = () => new Promise((resolve, reject) => {


    const check = setInterval(() => {

      console.log("check")

      if (allTenants) {
        clearInterval(check)
        resolve(allTenants)
      }
    }, 100)


  })


app.whenReady().then(() => {




  const { screen } = require('electron')



  ipcMain.handle('status', async (event, someArgument) => {
    const result = await getStatus()
    win.show()
    return result
  })



  let icon
  let successIconURL = "data:image/png;base64,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"

  let failIconURL = "data:image/png;base64,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"

  if (process.platform === "win32") {
    icon = nativeImage.createFromPath(path.join(__dirname, "assets", "cloud_success.png"))
  } else {
    icon = nativeImage.createFromPath(path.join(__dirname, "assets", "cloud_success.png"))
  }
  
 
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

    console.log(screen.getCursorScreenPoint())

    if (!win) {
      console.log("no window")
      createWindow(screen.getCursorScreenPoint())
      win.on('minimize',() => win.destroy());
    } else {

      if (win.isDestroyed()) {
        console.log("the window is dead!")
        createWindow(screen.getCursorScreenPoint())
        win.on('minimize',() => win.destroy());
      }

      else if (win.isVisible()) {

        console.log("Window visible, closing!")
        win.destroy()

      } else if (!win.isVisible()) {
        win.show()
      }

    }

  })


  tray.on("right-click", (event) => {

    app.quit()

  })

  const folderWarnings = []

  const handleCheck = () => {

    const newFolderWarnings = []

    let newIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "cloud_warning.png"))
    let successIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "cloud_success.png"))



    syncCheck.main()
    .then((tenants) => {

      allTenants = tenants

      for (let tenant of tenants) {

        for (let folder of tenant.foldersOnDisk) {

          if (!folder.sync) {

            if (!folderWarnings.includes(folder.name)) {
              folderWarnings.push(folder.name)
              newFolderWarnings.push(folder.name)
            }


          } else {

            if (folderWarnings.includes(folder.name)) {

              for (let i = 0; i < folderWarnings.length; i++) {

                if (folderWarnings[i] === folder.name) folderWarnings.splice(i, 1)

              }

            }

          }

        }

              // Check for deleted folder
      for (let i = 0; i < folderWarnings.length; i++) {

        if (!tenant.foldersOnDiskString.includes(folderWarnings[i])) {

          folderWarnings.splice(i,1)

        }

      }


      }

      if (newFolderWarnings.length > 0) {

        tray.setImage(newIcon)

        createDialogWindow()

      }



      if (folderWarnings.length === 0) {
        tray.setImage(successIcon)

      }

    })

    console.log({folderWarnings})

  }

  handleCheck()

  setInterval(() => {

    handleCheck()



  }, 15000 )
  
})