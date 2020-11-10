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

export function envGetYearFilters(theYear) {
  const filterParse = (filter) => {
    return filter.substring(0, 1) === "-"
      ? (incoming) =>
          !(incoming.toLowerCase() === filter.substring(1).toLowerCase())
      : (incoming) =>
          incoming.toLowerCase() === filter.substring(1).toLowerCase();
  };

  return (
    (process.env?.REACT_APP_COUNTRIES || "")
      .split(";")
      .reduce((current, incoming) => {
        let [year, filters] = incoming.split("|");
        current[year] = filters.split(",").map(filterParse);

        return current;
      }, {})[theYear] || []
  );
}
