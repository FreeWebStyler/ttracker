const ipc = require('electron').ipcRenderer;
const fs  = require("fs");

function cl(m){ console.log(m);}

function debug(m){ cl(m); $('#debug').html(m); }
function da(m){ cl(m); $('#debug').append('<br>'+m); }
function isset(e){ return typeof e != 'undefined' ? true : false;};

//const settings = require('./config/settings');
settings = null;
settings_fp = './config/settings.json';

fs.readFile(settings_fp, 'utf-8', function (err, data) {
    if(err){
        console.error('An error ocurred reading the file :' + err.message);
        return;
    }
    try {
        settings = JSON.parse(data);
    } catch(e){
        alert('Error! Can\'t parse settings file "' + settings_fp +'".\nException: ' + e);
    }
});

//////////////

ipc.on('da', function (event, m) {
  //alert(arg.message);
  //cl('DEBUG!');
  cl(m);
  da(m);
})

ipc.on('debug', function (event, arg) {
  //alert(arg.message);
  //cl('DEBUG!');
  cl(arg.message);
  debug(arg.message);
})

ipc.on('alert', function (event, arg) {
  //alert(arg.message);
  //cl('DEBUG!');
  cl(arg.message);
  alert(arg.message);
})
////////////////

function insertFolder(folder){

    actions = '<input class=action id="toRAM '+folder+'" type=button value="to RAM">';

    actions+= ' <input class=action id="backup '+folder+'" type=button value="Backup">';

    actions+= ' <input class=action id="clear '+folder+'" type=button value="Clear">';

    actions+= ' <input class=action id="umount '+folder+'" type=button value="Umount">';

    actions+= '<img id="load'+folder+'" src=sources/img/ring-alt.gif style=display:none;position:relative;left:3px;top:5px;height:16px>';

    $('#folders').append('<tr><td>'+folder+'</td><td>'+actions+'</td></tr>');

}

ipc.on('get_services-reply', function (event, arg) {
    var services = arg.reply;
    for (var prop in services) {
       //arr.push(data[prop]);
       $('#services').append(services[prop]+
       ' &nbsp; &nbsp; &nbsp; <input class=services_action id="'+prop+' start" type=button value=Start> '+
       '<input class=services_action id="'+prop+' stop" type=button value=Stop> '+
       '<input class=services_action id="'+prop+' restart" type=button value=Restart> '+
       '<input class=services_action id="'+prop+' status" type=button value=Status> '+
       '<input class=services_action id="'+prop+' config" type=button value=Config><p>'
       );   //debug(services[prop]);       //debug(prop);
    }

    $('.services_action').on('click', function(){
        ipc.send("service action", this.id);
    });
    /*services.forEach(function(item, i, arr) {
        alert(item):
    });*/
});

ipc.on('folders', function (event, arg) {

    var folders = arg.folders;
    //var folders = arg.folders.split(' ');

    //alert(folders);
    //document.getElementById('folders1').innerHTML = folders;
    //var arr = str.split([separator][, limit]);

    folders.forEach(function(item, i, arr) {
        if(item != '') insertFolder(item);
        //alert( i + ": " + item + " (массив:" + arr + ")" );
        //alert( i + ": " + item );
    });

    $('.action').on('click', function(){
        //to = this.toString().split(' ');
        action_do = this.id.split(' ');

        ipc.send(action_do[0], action_do[1]);
        var jq = '#load'+action_do[1].replace('.','\\\.');
        $(jq).css('display','inline-block');

        /*switch (action_do[0]) {
            case 'toRAM':
            //alert('#load'+action_do[1]);
                var jq = '#load'+action_do[1].replace('.','\\\.'); cl('#loadPriceRunner\\.HDD');
                $(jq).css('display','inline-block');
                //$('#loadPriceRunner\\.HDD').css('display','');
                ipc.send('toRAM', action_do[1]);
                break;
            case 'backup':
            //alert('#load'+action_do[1]);
                var jq = '#load'+action_do[1].replace('.','\\\.'); cl('#loadPriceRunner\\.HDD');
                $(jq).css('display','inline-block');
                //$('#loadPriceRunner\\.HDD').css('display','');
                ipc.send('backup', action_do[1]);
                break;
            case 'clear':
            //alert('#load'+action_do[1]);
                var jq = '#load'+action_do[1].replace('.','\\\.'); cl('#loadPriceRunner\\.HDD');
                $(jq).css('display','inline-block');
                //$('#loadPriceRunner\\.HDD').css('display','');
                ipc.send('clear', action_do[1]);
                break;
            case 'umount':
            //alert('#load'+action_do[1]);
                var jq = '#load'+action_do[1].replace('.','\\\.'); cl('#loadPriceRunner\\.HDD');
                $(jq).css('display','inline-block');
                //$('#loadPriceRunner\\.HDD').css('display','');
                ipc.send('umount', action_do[1]);
                break;
            default:

        }*/
    })    //var actions = document.querySelectorAll('.action');    //var actions = document.querySelector('.action');
})

//ipcRenderer.on('info' , function(event , data){ console.log(data.msg) });

ipc.on('copy-reply', function (event, arg) {
    $('#status').html(arg.reply);
    var jq = '#load'+arg.folder.replace('.','\\\.');
    $(jq).css('display','none');
  //alert(arg);
})

ipc.on('backup-done', function (event, arg) {
    $('#status').html('Backup - Done!' + arg.folder);
    var jq = '#load'+arg.folder.replace('.','\\\.');
    $(jq).css('display','none');
  //alert(arg);
})

ipc.on('sql_history-reply', function (event, arg) {
    //const message = `CopyPR reply: ${arg}`
    //sql_history = arg.reply.split('\n');

    var sql_history = JSON.parse(arg.reply);

    sql_history.forEach(function(item, i, arr) {
        if(item != '') $('#sql_history').append('<option class=mysql-history>'+item+'</option>');
        //alert( i + ": " + item + " (массив:" + arr + ")" );        //alert( i + ": " + item );
    });

    $("#sql_history").change(function() {

        $("select option:selected").each(function(){
            $('#input_import').val($( this ).text());
          //str += $( this ).text() + " ";
          //cl(str);
        });
    });
    //document.getElementById('status').innerHTML = history;
})

var resizeInterval = null;
var resizeTime = new Date().getTime();

$(window).resize(function() {

    resizeTime = new Date().getTime();

    if(resizeInterval === null){
        resizeInterval = setInterval(
            function(){
                var nowTime = new Date().getTime();
                if((nowTime - resizeTime) > 1000){
                    ipc.send('save_settings', {option: 'window_size', value: { width : window.outerWidth, height: window.outerHeight } });
                    resizeTime = nowTime;
                    clearInterval(resizeInterval);
                    resizeInterval = null;
                }
            }, 300);
    }
});

lastX = window.screenX;
lastY = window.screenY;

interval = setInterval(function(){
    if(window.screenX != lastX || lastY != window.screenY){
         ipc.send('save_settings', {option: 'window_position', value: { x : window.screenX, y: window.screenY } });
         lastX = window.screenX; lastY = window.screenY;
    }
}, 500);