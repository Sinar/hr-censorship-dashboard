// taken from https://stackoverflow.com/a/5723274/5742
export function truncate(fullStr, strLen, separator) {
  if (fullStr.length <= strLen) return fullStr;

  separator = separator || "...";

  const sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = strLen < 10 ? Math.ceil(charsToShow / 2) : charsToShow - 5,
    backChars = strLen < 10 ? Math.floor(charsToShow / 2) : 5;

  return (
    fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars)
  );
}
