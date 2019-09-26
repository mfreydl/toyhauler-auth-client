import { ConfigLoader } from './common/ConfigLoader';


/** The in-memory representation of the authclient config file.
 */
export class AuthClientConfig {
  private static loader = new ConfigLoader<AuthClientConfig>("~/.config/toyhauler-auth-client", "config.json")

  static load(): AuthClientConfig|undefined {
    let cfg = this.loader.load();  // yeah this is real helpful - maybe we should just accept the .loader.load() syntax and expose the loader itself?
    return cfg;
  }
  
  constructor() {
    
  }
  public authApiBaseUrl: string|undefined; 
}
