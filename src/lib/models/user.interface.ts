export interface UserInterface {
  id: number;
  firebase_id: string;
  email?: string | null;
  email_verified: boolean;
  display_name?: string | null;
  phone_number?: string | null;
  disabled: boolean;
  creation_time?: string | null;
  last_sign_in_time?: string | null;
  last_refresh_time?: string | null;
  tokens_valid_after_time?: string | null;
}

export interface FirebaseUserInterface {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  disabled: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface UsersListResponseInterface {
  users: FirebaseUserInterface[];
  pageToken?: string;
  total: number;
}

export interface UserClaimsInterface {
  operator?: boolean;
  admin?: boolean;
  sudo?: boolean;
  [key: string]: unknown;
}

export interface UserPermissionsInterface {
  isOperator: boolean;
  isAdmin: boolean;
  isSudo: boolean;
  hasAnyRole: boolean;
  hasPanelAccess: boolean;
}
