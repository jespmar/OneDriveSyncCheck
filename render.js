const { ipcRenderer } = require('electron');


const callForStatus = () => {

  // Renderer process
ipcRenderer.invoke('status', "").then((result) => {
  //console.log(result)

  const syncDiv = document.getElementById("syncDiv")
  const noSyncDiv = document.getElementById("noSyncDiv")

  for (let i = 0; i < result.sync.length; i++) {

    let s = result.sync[i]

    const li = document.createElement("li");
    const node = document.createTextNode(s);

    li.appendChild(node);
    syncDiv.appendChild(li);

  }

  for (let i = 0; i < result.noSync.length; i++) {

    let s = result.noSync[i]

    const li = document.createElement("li");
    const node = document.createTextNode(s);

    li.appendChild(node);
    noSyncDiv.appendChild(li);

  }


})

}


callForStatus()

