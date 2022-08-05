
const registry = require("./registry")
const fs = require("fs")
const path = require("path")

let dataPath

const main = async () => {

    const tenantRegistryData = await registry.doItAll()

    const tenants = []
    
    for (let tenant of tenantRegistryData) {


        // Exclude personal OneDrive
        if (!tenant.name.includes("OneDrive")) {
            let t = {
                name: tenant.name,
                parentURL: tenant.parentURL,
                registryFolders: tenant.folderStrings,
                foldersOnDisk: {},
            }
    
    
            // Get folders on disk
            const directoriesInDIrectory = fs.readdirSync(t.parentURL, { withFileTypes: true })
            .filter((item) => !item.name.includes(".ini"))
            .map((item) => item.name);
    
            for (let dir of directoriesInDIrectory) {
    
                const folderPath = path.join(t.parentURL, dir)
    
                let folder = {name: dir, path: folderPath, sync: false}
                
                if (t.registryFolders.includes(folderPath)) folder.sync = true
    
                t.foldersOnDisk[folder.name] = folder
       
            }
    
            tenants.push(t)
        }



    }

    //console.log(tenants)

    return tenants

}

const writeStateFile = (data) => {

  //  console.log("Writing State File")

    let package = JSON.stringify(data);
    let p = path.join(dataPath,"state.json")
   // console.log(p)
    fs.writeFileSync(p, package, null, 2);

  }



const compareState = (ten, state) => {

    let stateUpdated = false

    for (let i = 0; i < ten.length; i++) {
        // Loop over tenants

        let t = ten[i]
        let s = state[i]

        //Get folders
        const folders = Object.keys(t.foldersOnDisk)
        const stateFolders = Object.keys(s.foldersOnDisk)

        // Loop over folders

        for (let folder of folders) {
            // Compare folder data

            // Check if folder exist in state data
            if (s.foldersOnDisk[folder]) {
             //   console.log("Folder exists in State")

                if (s.foldersOnDisk[folder].sync && !t.foldersOnDisk[folder].sync) {
                    s.foldersOnDisk[folder].sync = false,
                    s.foldersOnDisk[folder].userNotified = false
                    s.foldersOnDisk[folder].lostSyncDate = new Date().toISOString()
                    stateUpdated = true
                }

                if (!s.foldersOnDisk[folder].sync && t.foldersOnDisk[folder].sync) {
                    s.foldersOnDisk[folder].sync = true,
                    s.foldersOnDisk[folder].syncDate = new Date().toISOString()
                    stateUpdated = true
                }

            } else {
            //    console.log("folder does not exist in state")
                // Check for sync and sync date
                if (t.foldersOnDisk[folder].sync) t.foldersOnDisk[folder].syncDate = new Date().toISOString()
                // Add folder to state
                s.foldersOnDisk[folder] = t.foldersOnDisk[folder]
                stateUpdated = true
            //    console.log(s.foldersOnDisk[folder])
            //    console.log("Folder added to state object")
            }

        }


        for (let folder of stateFolders) {

            // Check if folder exist on disk

            if (!t.foldersOnDisk[folder]) {

                // Remove folder from state
                delete s.foldersOnDisk[folder]
             //   console.log("Removed folder from state")
                stateUpdated = true
            }


        }

        


    }

    return {state, stateUpdated}

}

// Get all synced tenants from registry

// For every tenant
    
    // Get folder on disk from parent folder

    // Check if folders is pressent in the tenant




    const run = (userData) => new Promise((resolve, reject) => {

        dataPath = userData
        console.log(dataPath)

        main()
        .then(ten => {
        
            let state
        
            // Check if state file exists
            if (fs.existsSync(path.join(dataPath, "state.json"))) {
        
                console.log("Loading State File")
                //file exists
        
                fs.readFile(path.join(dataPath, "state.json"), (err, data) => {
                    if (err) throw err;
                    state = JSON.parse(data);
                    console.log(state);
                    let compare = compareState(ten, state)
        
                    if (compare.stateUpdated) writeStateFile(compare.state)
                });
        
        
          
        
            } else {
                // Set sync dates
        
                for (let t of ten) {
        
                    const folders = Object.keys(t.foldersOnDisk)
        
                   // console.log(folders)
            
                     for (let folder of folders) {
            
                        if (t.foldersOnDisk[folder].sync) t.foldersOnDisk[folder].syncDate = new Date().toISOString()
                       // console.log(t.foldersOnDisk[folder])
            
                    } 
        
                }
        
        
                // Write state to disk
                writeStateFile(ten)   
            }
           // console.log(ten)
        
        })


        resolve()

    })




    module.exports = {run};