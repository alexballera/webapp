(function () {
  'use strict'
  var loadCSS = require('./lib/loadCSS')
  var onClickMenu = require('./lib/onClickMenu')

  document.addEventListener('DOMContentLoaded', onDOMLoad)

  function onDOMLoad () {
// Variables Globales
    var btnMenu = document.getElementById('btnMenu')
    var navbarMenu = document.getElementById('navbarMenu')
    var headerElem = document.querySelector('header')

// Menú
    btnMenu.addEventListener('click', onClickMenu)

// Load CSS
    var url = [
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.css',
      'https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.css'
    ]
    loadCSS(url)
  }
}())

