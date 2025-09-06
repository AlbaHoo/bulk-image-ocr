declare module '*.css' {
  const styles: { [className: string]: string };
  export default styles;
}
declare module '*.less' {
  const styles: { [className: string]: string };
  export default styles;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

declare interface Window {
  __insp: {
    push(eventInfo: any): void;
  };
  Beacon(...options: any[]): void;
  lwsClientAPI: IClientApi
}
