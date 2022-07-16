const { ipcRenderer } = require('electron');


const callForStatus = () => {

  // Renderer process
ipcRenderer.invoke('status', "").then((result) => {
  console.log(result)

  const syncDiv = document.getElementById("syncDiv")
  const noSyncDiv = document.getElementById("noSyncDiv")

  for (let tenant of result) {

    const header = document.createElement("h4")
    header.classList.add("tenant")
    const headerNode = document.createTextNode(tenant.name);
    header.appendChild(headerNode)
    syncDiv.appendChild(header)

    for (let folder of tenant.foldersOnDisk) {

      const li = document.createElement("div");
      li.classList.add("row")
      const span = document.createElement("div");
      span.classList.add("label")
      const img = document.createElement("img");
      img.classList.add("icon")
      if (folder.sync) {
        img.src = "../../assets/folder-cloud.png";
        li.classList.add("normal")
      }
      else {
        img.src = "../../assets/folder-fail.png";
        li.classList.add("red")
      }
      img.width = 24
      img.heigh = 24
      const node = document.createTextNode(folder.name);
      li.appendChild(img)
      span.appendChild(node);
      li.appendChild(span)
      syncDiv.appendChild(li);
  
    }

  }

  

})

}


callForStatus()

