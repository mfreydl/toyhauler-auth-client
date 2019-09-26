import * as path from 'path'
import { utils } from "./utils";


// TODO:  If this gets more useful or bulletproof, consider promoting this toyhauler-common?
export class ConfigLoader<TConfig> {
  constructor(public configFolderPath: string, public fileName: string) {
    
  }

  public load(): TConfig|undefined {
    let cfg = utils.deserializeJsonFile<TConfig>(path.join(this.configFolderPath, this.fileName));
    return cfg;
  }
}
