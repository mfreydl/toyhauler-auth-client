import * as path from "path"
import { SingleResult } from "toyhauler-common/dist/contracts";
import { User, Tenant } from "toyhauler-common/dist/security";
import axios, { AxiosResponse } from "axios"
import { utils } from './utils'
import { AuthClientConfig } from "./AuthClientConfig";
import { TokenHolder } from "./tokenHolder";

export class AuthClient {

  static DEFAULT_API_AUTH_URL = "http://auth.toyhauler.io"
  /** Hardcoded to match the current setting on the server.
   * TODO: Get this from a config that is copied from the server proiject to the client project on build.
   */
  static TOKEN_HEADER_PARAM = "authorization";

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

  /** Logs in remotely with the given credentials.  
   * Returns a valid token in the headers of the response 
   * and the user info in the body of the response.
   * @param login The human readable unique identifier for the user.
   * @param password the secret held for this particular user.
   * @param tenantCode (optional) Unique identifier of the tenant to activate with this authentication.
  */
  public async authenticate(login: string, password: string, tenantCode?: string): Promise<SingleResult<TokenHolder>> {
    return new Promise<SingleResult<TokenHolder>>(async (resolve,reject) => {
      try {
        // let url = path.join(this.authApiRootUrl, "authenticate");
        let url = "authenticate";
        let req = { login: login, password: password, tenantCode: tenantCode };
        let options = { 
            "baseURL": this.authApiRootUrl, 
            "headers": { "content-type": "application/json" } 
          };
        let apiResponse = await axios.post<SingleResult<User>>(url, req, options); 
        let result = this.convertToTokenHolderResponse(apiResponse);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }


  /** Replaces the user in the output with a TokenHolder so that they client consumer has access to the token.
   * throws if the axios response does not contain a data property. */
  private convertToTokenHolderResponse(apiResponse: AxiosResponse<SingleResult<User>>): SingleResult<TokenHolder> {
    if (apiResponse.data) {
      // TODO:  Dont construct new - just cast or ducktype and replace the output property.
      let result = new SingleResult<TokenHolder>(apiResponse.data.success, apiResponse.data.message, apiResponse.data.error, undefined, apiResponse.data.validation);
      if (apiResponse.data.output) {
        let token: string|undefined = apiResponse.headers[AuthClient.TOKEN_HEADER_PARAM];
        if (!token) throw new Error(`Authentication service did not provide a user token.`);
        result.output = new TokenHolder(apiResponse.data.output, token);
      }   
      return result;
    } else {
      throw new Error(`Authentication request did not return an output object. HttpStatus: ${apiResponse.status} ${apiResponse.statusText}`);
    }
  }

  /** Provides the ability to extend an existing token.
   *  Returns failure for invalid or revoked tokens.
   *  Returns any errors encountered refreshing.  
   * @param currentToken The JWT token returned in a prior request.
   * */
  public async refreshToken(currentToken: string): Promise<SingleResult<TokenHolder>> {
    return new Promise<SingleResult<TokenHolder>>(async (resolve,reject) => {
      try {
        let url = "refreshToken";
        let req = { };
        let options = { 
          "baseURL": this.authApiRootUrl, 
          "headers": { 
            "content-type": "application/json", 
            [AuthClient.TOKEN_HEADER_PARAM]: currentToken 
          } 
        };
        let apiResponse = await axios.post<SingleResult<User>>(url, req, options);
        let result = this.convertToTokenHolderResponse(apiResponse);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }


  /** Provides the ability to extend an existing token.
   *  Returns failure for invalid or revoked tokens.
   * @param currentToken The JWT token returned in a prior request.
   * @param tenantCode Unique identifier of the tenant being switched to.
   *  Returns any errors encountered refreshing.  */
  public async switchTenant(currentToken: string, tenantCode: string): Promise<SingleResult<TokenHolder>> {
    return new Promise<SingleResult<TokenHolder>>(async (resolve,reject) => {
      try {
        let url = "switchTenant";
        let req = { newTenantCode: tenantCode };
        let options = { 
          "baseURL": this.authApiRootUrl, 
          "headers": { 
            "content-type": "application/json", 
            [AuthClient.TOKEN_HEADER_PARAM]: currentToken 
          } 
        };
        let apiResponse = await axios.post<SingleResult<User>>(url, req, options);
        let result = this.convertToTokenHolderResponse(apiResponse);
        resolve(result);
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
   * @param currentToken The JWT token returned in a prior request.
   *  */
  public async registerTenant(tenantName: string, newUser: boolean, userName: string, password: string, tenantCode?: string, currentToken?: string): Promise<SingleResult<Tenant>> {
    return new Promise<SingleResult<Tenant>>(async (resolve,reject) => {
      try {
        let url = "tenants";
        let req = { tenantName: tenantName, newUser: newUser, userName: userName, password: password, tenantCode: tenantCode };
        let options = { 
          "baseURL": this.authApiRootUrl, 
          "headers": { 
            "content-type": "application/json", 
            [AuthClient.TOKEN_HEADER_PARAM]: currentToken 
          } 
        };
        let response = await axios.post<SingleResult<Tenant>>(url, req, options);        
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    });
  }
}