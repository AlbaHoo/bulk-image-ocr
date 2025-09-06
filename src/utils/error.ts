export class APIFunctionError<ERROR_DATA = Record<string, any>> extends Error {
  data?: ERROR_DATA;
  constructor(message?: string, extra?: { name?: string; data?: ERROR_DATA }) {
    super(message);
    this.data = extra?.data;
    this.name = extra?.name || this.name;
  }
}
