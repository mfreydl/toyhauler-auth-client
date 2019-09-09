import { User } from "toyhauler-common/dist/security";

export class TokenHolder {
  /**
   * @param user A user or principal (ie: tenantCode is optional)
   * @param token The JWT returned by the auth api.  If there's a tenantCode, 
   * then the token is a tenant-user token. Otherwise just a user token.
   */
  constructor(public user: User, public token: string) {
    
  }
}