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

  let folderWarnings = []
  let folderWarningsObj = []

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

    let newIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "warn.png"))
    let successIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "success.png"))




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
             // if (win || !win.isDestroyed()) win.reload()
            }


          } else {

            if (folderWarnings.includes(folder.name)) {

              for (let i = 0; i < folderWarnings.length; i++) {

                if (folderWarnings[i] === folder.name) {
                  folderWarnings.splice(i, 1)
                  folderWarningsObj.splice(i, 1)
                  writeStateFile({folderWarnings,folderWarningsObj})
                 // if (win || !win.isDestroyed()) win.reload()
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
         // if (win || !win.isDestroyed()) win.reload()

        }

      }


      }

      if (newFolderWarnings.length > 0) {

        createDialogWindow()

        writeStateFile({folderWarnings,folderWarningsObj})
       // if (win || !win.isDestroyed()) win.reload()

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