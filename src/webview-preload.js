'use strict';

onload = function onload() {
  var webview = document.querySelector('webview');
  var indicator = document.querySelector('.indicator');

  var loadstart = function loadstart() {
    indicator.innerText = 'loading...';
  };

  var loadstop = function loadstop() {
    indicator.innerText = '';
  };

  webview.addEventListener('did-start-loading', loadstart);
  webview.addEventListener('did-stop-loading', loadstop);
};