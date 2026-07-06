const FLASH_PARAMS = new Set(["success", "error"]);

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

