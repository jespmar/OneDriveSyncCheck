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

  const height = 250
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

  let failIcon =  "data:image/png;base64,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"


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

  const writeStateFile = (data) => {

    console.log("Writing State File")

    let package = JSON.stringify(data);
    let p = path.join(app.getPath('userData'), "state.json")
    console.log(p)
    fs.writeFileSync(p, package, null, 2);

  }

  let folderWarnings = []
  let folderWarningsObj = []
  let hasError = false

  const loadData = () => {

    if (fs.existsSync(path.join(app.getPath('userData'), "state.json"))) {

      console.log("Loading State File")
      //file exists

      fs.readFile(path.join(app.getPath('userData'), "state.json"), (err, data) => {
        if (err) throw err;
        let state = JSON.parse(data);
        console.log(state);
        folderWarningsObj = state.folderWarningsObj
        folderWarnings = state.folderWarnings
    });

    }



  }

  const handleCheck = () => {

    const newFolderWarnings = []

    let newIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "cloud_fail.png"))
    let successIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "cloud_success.png"))




    syncCheck.main()
    .then((tenants) => {

      // TODO: Break this down into smaller functions and move to its own file

      allTenants = tenants

      for (let tenant of tenants) {

        for (let folder of tenant.foldersOnDisk) {

          if (!folder.sync) {

            if (!folderWarnings.includes(folder.name)) {
              const f = {
                name: folder.name,
                tenant: tenant.name,
                path: folder.path,
                date: new Date().toISOString()
              }
              folderWarnings.push(folder.name)
              folderWarningsObj.push(f)
              newFolderWarnings.push(folder.name)
            }


          } else {

            if (folderWarnings.includes(folder.name)) {

              for (let i = 0; i < folderWarnings.length; i++) {

                if (folderWarnings[i] === folder.name) {
                  folderWarnings.splice(i, 1)
                  folderWarningsObj.splice(i, 1)
                  writeStateFile({folderWarnings,folderWarningsObj})
                }

              }

            }

          }

        }

              // Check for deleted folder
      for (let i = 0; i < folderWarnings.length; i++) {

        if (!tenant.foldersOnDiskString.includes(folderWarnings[i])) {

          folderWarnings.splice(i,1)
          folderWarningsObj.splice(i, 1)
          writeStateFile({folderWarnings,folderWarningsObj})

        }

      }


      }

      if (newFolderWarnings.length > 0) {

        createDialogWindow()

        writeStateFile({folderWarnings,folderWarningsObj})

        console.log({folderWarnings})
        console.log({folderWarningsObj})

      }


      if (folderWarnings.length > 0 && !hasError) {

        tray.setImage(newIcon)
        hasError = true

      }



      if (folderWarnings.length === 0) {
        tray.setImage(successIcon)
        hasError = false

      }

    })



  }  

  loadData()

  handleCheck()

  setInterval(() => {

    handleCheck()

  }, 15000 )
  
})