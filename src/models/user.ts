export enum DefaultPrivacyLevel {
  public = "public",
  private = "private",
  contacts = "contacts",
}
export declare type AnyRecord = {
  [key: string]: any
}
export   interface PortalApplication {
  id: string;
  icon?: string;
  name: string;
  info?: string;
  logo?: string;
  link?: {
    href:string,
    target?:string
  }& AnyRecord;
  action?: any;
}

export interface IdToken {
  raw: string
  details : any
}
export interface User {
  id?: string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  email?: string;
  photo?: string;
  phoneNumber?: string;
  balance?: number;
  avatar?: string;
  defaultPrivacyLevel?: DefaultPrivacyLevel;
  createdAt?: Date;
  modifiedAt?: Date;
  organization?: Organization
  [key:string]: any
}

export type UserSettingsPayload = Pick<
  User,
  "firstName" | "lastName" | "email" | "phoneNumber" | "defaultPrivacyLevel"
>;

declare type Organization = {
  status: string;
  orgId: string;
  bpid: string;
  orgName: string;
  roles: string[];
}
 