const FLASH_PARAMS = new Set(["success", "error"]);
const EMBEDDED_SEARCH_STORAGE_KEY =
  "collection-popularity-sorter:embedded-search";

function splitTarget(target: string) {
  const hashIndex = target.indexOf("#");
  const withoutHash = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
  const hash = hashIndex >= 0 ? target.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");

  return {
    pathname: queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash,
    search: queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "",
    hash,
  };
}

export function withEmbeddedQueryParams(
  target: string,
  currentSearch: string,
  extraParams: Record<string, string> = {},
) {
  const {pathname, search, hash} = splitTarget(target);
  const params = new URLSearchParams(search);
  const currentParams = new URLSearchParams(currentSearch);

  currentParams.forEach((value, key) => {
    if (!FLASH_PARAMS.has(key) && !params.has(key)) {
      params.append(key, value);
    }
  });

  Object.entries(extraParams).forEach(([key, value]) => {
    params.set(key, value);
  });

  const nextSearch = params.toString();

  return `${pathname}${nextSearch ? `?${nextSearch}` : ""}${hash}`;
}

export function getReusableEmbeddedSearch(currentSearch: string) {
  if (typeof window === "undefined") {
    return currentSearch;
  }

  const params = new URLSearchParams(currentSearch);
  const hasEmbeddedParams =
    params.has("shop") || params.has("host") || params.has("id_token");

  try {
    if (hasEmbeddedParams) {
      window.sessionStorage.setItem(
        EMBEDDED_SEARCH_STORAGE_KEY,
        currentSearch,
      );
      return currentSearch;
    }

    return (
      window.sessionStorage.getItem(EMBEDDED_SEARCH_STORAGE_KEY) ??
      currentSearch
    );
  } catch {
    return currentSearch;
  }
}
