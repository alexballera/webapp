(function () {
  'use strict'
  var loadCSS = require('./lib/loadCSS')
  var onScroll = require('./lib/onScroll')
  var onClickMenu = require('./lib/onClickMenu')
  var onClickVideo = require('./lib/onClickVideo')

  document.addEventListener('DOMContentLoaded', onDOMLoad)

  function onDOMLoad () {
// Variables Globales
    var btnMenu = document.getElementById('btnMenu')
    var navbarMenu = document.getElementById('navbarMenu')
    var video = document.getElementsByTagName('video')[0]
    var videoVideo = document.getElementById('video')
    var headerElem = document.querySelector('header')

// Menú
    btnMenu.addEventListener('click', onClickMenu)

// Video
    videoVideo.addEventListener('click', onClickVideo)

// Scroll
    headerElem.addEventListener('scroll', onScroll)

// Load CSS
    var url = [
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.css',
      'https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.css'
    ]
    loadCSS(url)
  }
}())

