const os = require("os");
const fs = require("fs")

const { exec } = require('child_process');

const { dialog } = require('electron')


// include the Node.js 'path' module at the top of your file
const path = require('path')
const doCheck = () => new Promise((resolve, reject) => {

    const compareFolders = (dirs, folders) => {

        let status = {
            sync: [],
            noSync: [],
            folderList: []
        }
    
        for (let dir of dirs) {
    
            if (folders.includes(dir)) {
                status.sync.push(dir)
                status.folderList.push({name: dir, sync: true})
              } else {
                status.noSync.push(dir)
                status.folderList.push({name: dir, sync: false})
              }
        }

        return status

    }

    let buffer = []
    let result = []
    let folders = []

    const homeDir = os.homedir()

    const oneDrivePath = path.join(homeDir, "Raksystems Insinööritoimisto Oy")

    const directoriesInDIrectory = fs.readdirSync(oneDrivePath, { withFileTypes: true })
    .filter((item) => !item.name.includes(".ini"))
    .map((item) => item.name);

    const powershellPath = path.join(__dirname, 'ps', 'onedrive.ps1')


    exec(powershellPath, {'shell':'powershell.exe'}, (error, stdout, stderr)=> {
     // console.log(stdout)
      console.log(stderr)
      const splitted = stdout.split("\n")
     // console.log(splitted)


      const arrayToObject = (array) => {

        let obj = {}

        for (let i = 0; i < array.length; i++) {

          let a = array[i]

          obj[a[0]] = a[1]

        }

        return obj

      }

      for (let i = 0; i < splitted.length; i++) {

        let p = splitted[i]
        let np = p.replace("\r", "")

        if (np !== "") {

          let sp = np.split(" :")
          sp[0] = sp[0].trim()
          sp[1] = sp[1].trim()

          buffer.push(sp)
          if (buffer.length === 6) {
            result.push(arrayToObject(buffer))
            folders.push(arrayToObject(buffer).DisplayName)
            buffer = []
          }
        } 

      }
      //console.log({folders})
      //console.log({directoriesInDIrectory})
      resolve(compareFolders(directoriesInDIrectory, folders))


/*       for (let i = 0; i < splitted.length; i++) {

        let res = splitted[i].split(":")

        result.push({path: res[0], status: res[1]})

      } */
      //console.log(result)

      if (error) {
        dialog.showMessageBox(null, {message: "error", type: "warning"})
      }
      // do whatever with stdout

  })

})


module.exports = doCheck
