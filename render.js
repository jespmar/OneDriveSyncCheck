const { ipcRenderer } = require('electron');


const callForStatus = () => {

  // Renderer process
ipcRenderer.invoke('status', "").then((result) => {
  console.log(result)

  const syncDiv = document.getElementById("syncDiv")
  const noSyncDiv = document.getElementById("noSyncDiv")

  for (let i = 0; i < result.folderList.length; i++) {

    let s = result.folderList[i]

    const li = document.createElement("li");
    const img = document.createElement("img")
    if (s.sync) img.src = "./assets/folder-cloud.png";
    else {
      img.src = "./assets/folder-fail.png";
      li.classList.add("red")
    }
    img.width = 24
    img.heigh = 24
    const node = document.createTextNode(s.name);
    li.appendChild(img)
    li.appendChild(node);
    syncDiv.appendChild(li);

  }

})

}


callForStatus()

