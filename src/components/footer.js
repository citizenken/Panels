var m = require("mithril")

module.exports = Footer = {
  view: function({state, attrs, dom}) {
    var cursorPos = attrs.stateData.currentDocument.currentCursorPosition,
        positionText = '';
        console.log(cursorPos)
    if (cursorPos) {
      positionText = "Line " + cursorPos.line + ", Column " + cursorPos.ch;
    }
    return m("div.footer", positionText);
  }
}