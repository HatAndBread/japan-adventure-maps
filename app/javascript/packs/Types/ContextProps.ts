export type Ride = {
  createdAt: null | string;
  updatedAt: null | string;
  id: null | number;
  popups: string;
  route: string;
  startLat: null | number;
  startLng: null | number;
  startTime: null | string;
  userId: null | number;
  title: null | string;
  mapImageUrl: null | string;
  description: null | string;
  rideType: null | string;
  isPrivate: boolean;
  isEvent: boolean;
};
export type Profile = {
  id: number;
  updatedAt: string;
  createdAt: string;
  userId: number;
  birthday: string | null;
  bikes: string | null;
  location: string | null;
  intro: string | null;
  avatar: string | null;
  startLat: number | null;
  startLng: number | null;
};

type User = {
  avatar: null | string;
  email: string;
  id: number;
  updatedAt: string;
  createdAt: string;
  username: string;
};
export interface ContextProps {
  controllerData: {
    controllerAction: string;
    currentUser: User;
    modelName: string;
    profile: Profile;
    profileBeingViewed?: Profile;
    ride?: Ride;
    participants?: {
      avatar: null | string;
      createdAt: null | string;
      updatedAt: null | string;
      id: null | number;
      userId: number;
      username: string;
      email: string;
    }[];
    comments?: {
      avatar: null | string;
      createdAt: null | string;
      updatedAt: null | string;
      id: null | number;
      content: string;
      rideId: number;
      username: string;
      userId: number;
    }[];
    profileUser: User;
    upcomingRides?: Ride[];
    routes?: Ride[];
  };
}
