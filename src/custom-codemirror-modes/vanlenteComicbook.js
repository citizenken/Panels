// jscs:disable
/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */


var definitions = {
  page: {
    regex: /^[A-Z]+$/,
    token: "vlc-page",
    next: "panel",
    description: "A number spelled out, uppercase",
    example: "ONE",
    template: "NUMBER"
  },
  panel: {
    regex: /^[P]anel( ?[0-9]+?\.?)?/,
    token: "vlc-panel",
    next: "action",
    description: "The word 'Panel', capitalized, followed by a panel number and a period",
    example: "Panel 2.",
    template: "Panel #."
  },
  character: {
    regex: /^[0-9]+\.? [A-Z0-9 ]+((?: \([A-Z]+\))?:?)?/,
    token: "vlc-character",
    next: "dialogue",
    description: "A number, followed by a character name, uppercase, followed by a colon",
    example: "5 JOHN:",
    template: "# NAME:"
  },
  dialogue: {
    regex: /[^\n]*/,
    token: "vlc-dialogue",
    next: "start",
    description: "Any character",
    example: "Suzy said you'd be coming by",
    template: "Some dialogue"
  },
  action: {
    regex: /^.*/,
    token: "vlc-action",
    next: "start",
    description: "Any character",
    example: "The car drives off the cliff",
    template: "Some action"
  }

}

module.exports = {
  // The start state contains the rules that are intially used
  start: [
    definitions['page'],
    definitions['panel'],
    definitions['character'],
    definitions['action'],
  ],
  panel: [
    definitions['panel'],
  ],
  action: [
    definitions['action'],
  ],
  dialogue: [
    definitions['dialogue'],
  ],
  // The multi-line comment state.
  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    name: 'vanlenteComicbook',
    dontIndentStates: ["comment"],
    lineComment: "//",
    defaultElement: definitions['action'],
    allTokens: function () {
      return definitions
    }
  }
}