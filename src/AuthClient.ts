import * as path from "path"
import { SingleResult } from "toyhauler-common/src/contracts";
import { User, Tenant } from "toyhauler-common/src/security";
import axios from "axios"
import { utils } from './utils'
import { AuthClientConfig } from "./AuthClientConfig";

export class AuthClient {

  static DEFAULT_API_AUTH_URL = "http://auth.toyhauler.io"
  /** Hardcoded to match the current setting on the server.
   * TODO: Get this from a config that is copied from the server proiject to the client project on build.
   */
  static TokenHeaderParam = "authorization";

  /** Local interface for the remote Toyhauler Auth Api.
   * @param authApiRootUrl Fully qualified base url for the auth api. 
   */
  constructor(authApiUrl?: string) {

    if (authApiUrl) {
      this.authApiRootUrl = authApiUrl;
    } else {
      // Load from the config or fall back on the default.  We want this to throw loudly on exception.
      let cfg = AuthClientConfig.load();
      this.authApiRootUrl = (cfg && cfg.authApiBaseUrl) || AuthClient.DEFAULT_API_AUTH_URL;
    }
  }

  public readonly authApiRootUrl: string;

  /** Logs in remotely with the given credentials.  */
  public async authenticate(login: string, password: string, tenantCode?: string): Promise<SingleResult<User>> {
    return new Promise<SingleResult<User>>(async (resolve,reject) => {
      try {
        let url = path.join(this.authApiRootUrl, "authenticate");
        let req = { login: login, password: password, tenantCode: tenantCode };
        let response = await axios.post<SingleResult<User>>(url, req);        
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Provides the ability to extend an existing token.
   *  Returns failure for invalid or revoked tokens.
   *  Returns any errors encountered refreshing.  */
  public async refreshToken(currentToken: string): Promise<SingleResult<User>> {
    return new Promise<SingleResult<User>>(async (resolve,reject) => {
      try {
        let url = path.join(this.authApiRootUrl, "refreshToken");
        let req = { };
        let reqCfg = { headers: { [AuthClient.TokenHeaderParam]: currentToken } };
        let response = await axios.post<SingleResult<User>>(url, req);        
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    });
  }


    /** Provides the ability to extend an existing token.
   *  Returns failure for invalid or revoked tokens.
   *  Returns any errors encountered refreshing.  */
  public async switchTenant(currentToken: string, tenantCode: string): Promise<SingleResult<User>> {
    return new Promise<SingleResult<User>>(async (resolve,reject) => {
      try {
        let url = path.join(this.authApiRootUrl, "switchTenant");
        let req = { newTenantCode: tenantCode };
        let reqCfg = { headers: { [AuthClient.TokenHeaderParam]: currentToken } };
        let response = await axios.post<SingleResult<User>>(url, req, reqCfg);
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    });
  }


  /** Declares a new organization in the toyhauler system.  
   * The given user account is made the administrator for that organization,
   * and if the new user flag is given, 
   * the user account will get created. 
   * @param tenantName Human readable friendly title for the tenant.  NOT used for system identification.
   * @param newUser Flag to create a new user account with the given credentials.
   * @param userName User to be the adminstrator for the new tenant.
   * @param password Password for the given user (desired password if the newuser flag is set).
   * @param tenantCode (optional) Desired unique identifier for the new tenant (if omitted one will be generated).
   *  */
  public async registerTenant(tenantName: string, newUser: boolean, userName: string, password: string, tenantCode?: string): Promise<SingleResult<Tenant>> {
    return new Promise<SingleResult<Tenant>>(async (resolve,reject) => {
      try {
        let url = path.join(this.authApiRootUrl, "tenants");
        let req = { tenantName: tenantName, newUser: newUser, userName: userName, password: password, tenantCode: tenantCode };
        let response = await axios.post<SingleResult<Tenant>>(url, req);        
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    });
  }
}