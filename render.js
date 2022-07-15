const { ipcRenderer } = require('electron');


const callForStatus = () => {

  // Renderer process
ipcRenderer.invoke('status', "").then((result) => {
  console.log(result)

  const syncDiv = document.getElementById("syncDiv")
  const noSyncDiv = document.getElementById("noSyncDiv")

  for (let tenant of result) {

    const header = document.createElement("h3")
    const headerNode = document.createTextNode(tenant.name);
    header.appendChild(headerNode)
    syncDiv.appendChild(header)

    for (let folder of tenant.foldersOnDisk) {

      const li = document.createElement("li");
      const img = document.createElement("img");
      img.classList.add("icon")
      if (folder.sync) img.src = "./assets/folder-cloud.png";
      else {
        img.src = "./assets/folder-fail.png";
        li.classList.add("red")
      }
      img.width = 24
      img.heigh = 24
      const node = document.createTextNode(folder.name);
      li.appendChild(img)
      li.appendChild(node);
      syncDiv.appendChild(li);
  
    }

  }

})

}


callForStatus()

