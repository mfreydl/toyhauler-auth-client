import * as path from 'path';
import { utils } from "./utils";

/** The in-memory representation of the authclient config file.
 */
export class AuthClientConfig {
  static CONFIG_FOLDER_PATH = "~/.config/toyhauler-auth-client"
  static FILENAME = "config.json"

  static load(): AuthClientConfig|undefined {
    let cfg = utils.deserializeJsonFile<AuthClientConfig>(path.join(this.CONFIG_FOLDER_PATH, this.FILENAME));
    return cfg;
  }
  

  constructor() {
    
  }
  public authApiBaseUrl: string|undefined; 
}
