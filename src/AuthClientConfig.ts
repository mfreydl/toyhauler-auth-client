/** The in-memory representation of the authclient config file.
 */
export class AuthClientConfig {
  static FILENAME = "config.json"
  constructor() {
    
  }
  public authApiBaseUrl: string|undefined; 
}
