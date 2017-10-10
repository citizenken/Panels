module.exports = {
  timestampToLocaletime
}

function timestampToLocaletime(ts) {
  return new Date(ts).toLocaleString();
}