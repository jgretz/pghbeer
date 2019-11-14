export default (string, length) =>
  string.length <= length ? string : `${string.substring(0, length)}...`;
