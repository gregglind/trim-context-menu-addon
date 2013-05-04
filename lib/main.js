/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {isBrowser} = require("window/utils");
const {WindowTracker} = require("sdk/deprecated/window-utils");
const simpleprefs = require("simple-prefs");
const myprefs = require("simple-prefs").prefs;
const data = require("self").data;
const tabs = require("tabs")

let Track = function(fn) WindowTracker({ onTrack: fn});
let browserOnly = function(fn) {
  return function(window) {
    if (!isBrowser(window)) return
    fn(window)
  }
}

let S = JSON.stringify.bind(JSON);
let P = JSON.parse.bind(JSON);

let contextmenutracker;

function onContextMenuPrefChange(prefName) {
  contextmenutracker = applytomenus();
}

simpleprefs.on("contextmenuconfig", onContextMenuPrefChange);
simpleprefs.on("launcheditor",function(){tabs.open(data.url("editor.html"))})

function applytomenus(){
	return Track(browserOnly(function(window){
	  let contextMenu = window.document.getElementById("contentAreaContextMenu");
	  let config = P(myprefs.contextmenuconfig);
		Array.forEach(contextMenu.children,function(x){
			let id = x.id;
			if (id){
				if (config[id] === undefined) config[id] = true;  // show it
				let show = config[id];
				if (! show){
					console.log("context-menu not showing:", id)
				}
				contextMenu.children[id].style.display = (["none",""][~~show]);
			}
		})
		myprefs.contextmenuconfig = S(config)
	}));
}

let initialsetup = function(){
	if (myprefs.contextmenuconfig === undefined) {
		myprefs.contextmenuconfig = S({})
		tabs.open(data.url("editor.html"))
	}
};


let editorPage = require("page-mod").PageMod({
  include: data.url("editor.html"),
  contentScriptFile: [data.url("jquery.js"),data.url("underscore.js"),data.url("editor.js")],
  onAttach: function(worker) {
  	let config = {};
  	if (myprefs.contextmenuconfig) {
  		config = P(myprefs.contextmenuconfig)
  	}
  	worker.port.emit("config",{config:config});
    worker.port.on("updated", function(config) {
      myprefs.contextmenuconfig = S(config) // will cascade
    });
  }
});


let main = exports.main = function(options,callback){
	initialsetup();
	contextmenutracker = applytomenus();
}


