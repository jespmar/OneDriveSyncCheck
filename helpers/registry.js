const regedit = require('regedit').promisified
const os = require("os");
const path = require("path")

// Get list of tenants from registry
async function main() {
  const listResult = await regedit.list('HKCU\\SOFTWARE\\Microsoft\\OneDrive\\Accounts\\Business1\\Tenants')

  //console.log(listResult)
 
  return listResult

}



// Function for getting folders in every tenant
const sortTenants = async (tenants) => {

    const tenantsArray = []
    //console.log(tenants)


    for (let tenant of tenants) {

        const tenantObj = {name: tenant, parentURL: path.join(os.homedir(), tenant)}

        const synced = await regedit.list(`HKCU\\SOFTWARE\\Microsoft\\OneDrive\\Accounts\\Business1\\Tenants\\${tenant}`)
        //console.log(synced)

        syncedKeys = Object.keys(synced)

        tenantObj.folders = synced[syncedKeys[0]].values
        tenantObj.folderStrings = Object.keys(synced[syncedKeys[0]].values)

        tenantsArray.push(tenantObj)

    }

    //console.log(tenantsArray)

    return tenantsArray

}


// TODO: Change this name
const doItAll = async () => {

    const listResult = await main()
    objectKeys = Object.keys(listResult)
    //console.log(result)
    const result = await sortTenants(listResult[objectKeys[0]].keys)

    //console.log(result)

    return result

}

doItAll()

module.exports = {doItAll}