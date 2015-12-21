var loadCSS = function (url) {
  for (var i = 0; i < url.length; i++) {
    var elem = document.createElement('link')
    elem.rel = 'stylesheet'
    elem.href = url[i]
    document.head.appendChild(elem)
  }
}
module.exports = loadCSS
