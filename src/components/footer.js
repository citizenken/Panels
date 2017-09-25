var m = require("mithril")

module.exports = Footer = {
  view: function({state, attrs, dom}) {
    var currentDoc = attrs.stateData.currentDocument,
        cursorPos = attrs.stateData.cursors[currentDoc].currentCursorPosition,
        positionText = '';
        console.log(cursorPos)
    if (cursorPos) {
      positionText = "Line " + cursorPos.line + ", Column " + cursorPos.ch;
    }
    return m("div.footer", positionText);
  }
}