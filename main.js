const { app, BrowserWindow, Tray, Menu, nativeImage, dialog, ipcMain, Notification } = require('electron')
const os = require("os");
const fs = require("fs")

const syncCheck = require("./helpers/syncChecker")

app.disableHardwareAcceleration()
app.setName("OneDrive Sync Tool (OST)")

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

 /*  const height = 250
  const width = 500

   dialogWin = new BrowserWindow({
    width,
    height,
    useContentSize: true,
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

  dialogWin.loadFile('views/dialog/dialog.view.html') */

  dialog.showMessageBox(  new BrowserWindow({
    show: false,
    alwaysOnTop: true
  }),{
    message: "OneDrive folder(s) is not being synchronized",
    title: "OneDrive Synchronization Error Discovered",
    type: "error",
    buttons: ["Show Errors", "Ignore"],
    detail: "We have discovered that one or more OneDrive/SharePoint folders is no loger synchronizing as they should. Action is needed from your part to prevent possible data loss. \n \nPlease click Show Errors and follow the instructions to fix this issue",
    noLink: true,
    cancelId: 1
  })

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
  let hasError = false

  const getStatus = () => new Promise((resolve, reject) => {


    const check = setInterval(() => {

      console.log("check")

      if (allTenants) {
        clearInterval(check)
        resolve({tenants: allTenants, hasError})
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



  if (process.platform === "win32") {
    icon = nativeImage.createFromPath(path.join(__dirname, "assets", "success.png"))
  } else {
    icon = nativeImage.createFromPath(path.join(__dirname, "assets", "success.png"))
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

  const writeStateFile = (data) => {

    console.log("Writing State File")

    let package = JSON.stringify(data);
    let p = path.join(app.getPath('userData'), "state.json")
    console.log(p)
    fs.writeFileSync(p, package, null, 2);

  }


  const handleCheck = () => {

    const newFolderWarnings = []

    let newIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "warn.png"))
    let successIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "success.png"))




    syncCheck.run(app.getPath('userData'))
    .then(() => {

      let sendNotification = false
      let stateChanged = false
      let errors = false

      // Get current state
      if (fs.existsSync(path.join(app.getPath('userData'), "state.json"))) {
        
        console.log("Loading State File")
        //file exists
        // Load state

        fs.readFile(path.join(app.getPath('userData'), "state.json"), (err, data) => {
            if (err) throw err;
            state = JSON.parse(data);
            console.log(state);
            allTenants = state

            // Do checks against state
            
            for (let tenant of state) {
              // Loop over tenants

              const folders = Object.keys(tenant.foldersOnDisk)

              // Loop over folders

              for (let folder of folders) {

                // Check if folder is not syncing and user has not ben notified

                if (!tenant.foldersOnDisk[folder].sync) {

                  errors = true

                  if (!hasError) {
                    hasError = true
                    tray.setImage(newIcon)
                  }


                  if (!tenant.foldersOnDisk[folder].userNotified) {

                  sendNotification = true
                  stateChanged = true
                  tenant.foldersOnDisk[folder].userNotified = true

                  }

                }

              }



            }

            if (stateChanged) writeStateFile(state)

            console.log("User needs to be notified")
            if (sendNotification) createDialogWindow()

            if (hasError && !errors) {
              hasError = false
              tray.setImage(successIcon)
            }


        });


    }

    })


  }  

  //loadData()

  handleCheck()

  setInterval(() => {

    handleCheck()

  }, 15000 )
  
})