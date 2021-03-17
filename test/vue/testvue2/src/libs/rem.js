function pageRem() {
  let winWidth = Math.max(window.innerWidth, document.documentElement.clientWidth)
  if (winWidth <= 280) winWidth = 280
  if (winWidth >= 750) winWidth = 750
  let targetRem = parseInt((winWidth / 750) * 32)
  if (targetRem % 2) {
    targetRem++
  }
  document.documentElement.style.fontSize = targetRem + 'px'
}
window.addEventListener('resize', pageRem)
pageRem()
