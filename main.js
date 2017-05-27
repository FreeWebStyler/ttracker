const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

const fs    = require("fs");
const ipc   = require('electron').ipcMain;

let win
settings = null;
settings_fp = './config/settings.json';

function cl(m){console.log(m);}
function da(m){ mainWindow.webContents.send('da', m);}
function isset(variable){ return typeof variable != 'undefined' ? 1 : 0;}

function createWindow() {

  win = new BrowserWindow({
        width: settings.window_size.width, height: settings.window_size.height,
        title: 'tTracker',icon: path.join(__dirname, '/images/clock.png')
    })

    win.setPosition(settings.window_position.x, settings.window_position.y);

    // and load the index.html of the app.
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

    // Open the DevTools.
    win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    });
}

app.on('ready', function () {

    fs.readFile(settings_fp, 'utf-8', function (err, data) {
        if(err){
            console.error("An error ocurred reading the file :" + err.message);
            settings = { window_size : { width: 800, height: 600}};
            return;
        }
        try {
            settings = JSON.parse(data);
        } catch(e){
            alert('Error! Can\'t parse settings file "' + settings_fp +'".\nException: ' + e);
        }

        settings = JSON.parse(data);
        createWindow();

    });
})

app.on('window-all-closed', () => { // Quit when all windows are closed.
  // On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

///////////////////// Save settings

ipc.on('save_settings', function (event, arg){ //services.copy();
    settings[arg.option] = arg.value;
    fs.writeFile(settings_fp, JSON.stringify(settings), function (err) {
        if(err) cl('An error while writing to settings file '+ err.message); else cl('Settings succesfully saved');
    });
})