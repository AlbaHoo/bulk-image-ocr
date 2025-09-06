// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // eslint-disable-next-line
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function upperFirstLetter(str: string) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}
