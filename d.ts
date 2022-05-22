declare module '*.png' {
  const value: any;
  export = value;
}
declare module '*.svg' {
  const value: any;
  export = value;
}
declare module '*.gif' {
  const value: any;
  export = value;
}
declare module '*.mp3' {
  const value: any;
  export = value;
}
declare module '*.wav' {
  const value: any;
  export = value;
}
declare module 'window' {
  global {
    interface Window {
      mapboxMap?: any;
      tdMap?: any;
      controlPointMarkers?: any;
      popupMarkers?: any;
      mapEventListenerAdder?: any;
      mapboxContainer: HTMLDivElement;
      tdContainer: HTMLDivElement;
      userLocation: any;
      markers: any[];
      FB: any;
      stop3D: any;
      isBadBrowser: boolean;
      isProbablyTable: boolean;
      isProbablyMobile: boolean;
      isProbablyNotDesktop: boolean;
      isProbablyDesktop: boolean;
      isTouchScreen: boolean;
      baseMapName: string;
      baseMapURL: string;
      currentCursor: string;
      mapFinishedLoading: boolean;
      rideLng: number;
      rideLat: number;
    }
  }
}
