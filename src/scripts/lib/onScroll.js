var onScroll = function () {
  if (window.scrollY >= 200) {
    headerElem.classList.toggle('.header__light')
  } else {
    headerElem.classList.toggle('.header__light')
  }
}

module.exports = onScroll
