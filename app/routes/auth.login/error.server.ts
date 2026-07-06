export function loginErrorMessage(errors: unknown) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return errors as Record<string, string>;
}
