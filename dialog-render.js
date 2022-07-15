const { ipcRenderer, remote, electron } = require('electron');

window.onload = (event) => {
    console.log('page is fully loaded');


    const button = document.getElementById("close")
    button.addEventListener("click", () => {
        console.log("click")
        window.close()
    })

  };


