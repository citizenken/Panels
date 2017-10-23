module.exports = {
  timestampToLocaletime,
  isElementOverflown
}

function timestampToLocaletime(ts) {
  return new Date(ts).toLocaleString();
}

function isElementOverflown(element) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}