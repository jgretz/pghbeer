/** Normalized service-account credential: inline key material or a key-file path. */
export type GoogleAuthConfig = {clientEmail: string; privateKey: string} | {keyFile: string};

export type ReadSheetValuesOptions = {
  spreadsheetId: string;
  range: string;
};

export type SheetTitlesOptions = {
  spreadsheetId: string;
};

/** Injectable token boundary — overridable in tests to avoid real credentials. */
export type SheetsDeps = {
  getAccessToken: () => Promise<string>;
};
