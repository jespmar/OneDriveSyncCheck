
const registry = require("./registry")
const fs = require("fs")
const path = require("path")

const main = async () => {

    const tenantRegistryData = await registry.doItAll()

    const tenants = []
    
    for (let tenant of tenantRegistryData) {


        if (!tenant.name.includes("OneDrive")) {
            let t = {
                name: tenant.name,
                parentURL: tenant.parentURL,
                registryFolders: tenant.folderStrings,
                foldersOnDisk: [],
                foldersOnDiskString: []
            }
    
    
            // Get folders on disk
            const directoriesInDIrectory = fs.readdirSync(t.parentURL, { withFileTypes: true })
            .filter((item) => !item.name.includes(".ini"))
            .map((item) => item.name);
    
            for (let dir of directoriesInDIrectory) {
    
                const folderPath = path.join(t.parentURL, dir)
    
                let folder = {name: dir, path: folderPath, sync: false}
                
                if (t.registryFolders.includes(folderPath)) folder.sync = true
    
                t.foldersOnDisk.push(folder)
                t.foldersOnDiskString.push(folder.name)
       
            }
    
            tenants.push(t)
        }



    }

    return tenants

}

// Get all synced tenants from registry

// For every tenant
    
    // Get folder on disk from parent folder

    // Check if folders is pressent in the tenant




    module.exports = {main};