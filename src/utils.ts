import * as path from "path"
import * as fs from "fs"
import * as os from 'os'
import * as commentJson from 'comment-json'

export class utils {

  /** Returns the instantiated object or array.  
   * Returns undefined for both an empty or missing source file. 
   * Uses JSON.parse and does not perform any explicit casting. 
   * Throws encountered exceptions.  Resolves tilde (~) path prefixes.
   * @param pathName Fully qualified path and filename of the json file.  
   * @param allowComments (default: false) Flag to use a json comment parser to support comments in the json file. 
   */
  public static deserializeJsonFile<T>(pathName: string, allowComments: boolean = false): T|undefined {
    try {
      let targetPathName = this.resolveHomeDir(pathName);
      if (!path.isAbsolute(targetPathName)) {  
        throw new Error(`Cannot deserialize: the pathName [${pathName}] is not a fully qualified path.`);
      }
      if (fs.existsSync(targetPathName)) {
        let json = fs.readFileSync(targetPathName, { encoding: 'utf-8'});
        if (allowComments) {
          let obj = commentJson.parse(json);
          return obj;
        } else {
          let obj = JSON.parse(json);
          return obj;
        }
      } else {
        return undefined;
      }
    } catch (err) {
      throw err;
    }
  }

  /** Uses JSON.stringify() to write the given object to a file.  Resolves tilde (~) path prefixes.
   * @param subject The object to serialize.
   * @param pathName Fully-qualified path and filename (eg "/users/JoeCool/.config/app-config.json").
   * @param allowComments (default: false) Flag to use a json comment parser to support comments in the json file. 
   */
  public static serializeJsonFile(subject: any, pathName: string, allowComments: boolean = false): void {
    let targetPathName = this.resolveHomeDir(pathName);
    if (!path.isAbsolute(targetPathName)) {
      throw new Error(`Cannot serialize: the pathName [${pathName}] is not a fully qaulified path`);
    }
    if (allowComments) {
      commentJson.stringify(subject, undefined, '  ');
    } else {
      fs.writeFileSync(targetPathName, JSON.stringify(subject, undefined, '  '))
    }
  }


  /** Replaces the leading tilde (~) in the given file path 
   * with the absolute path to the os.homedir (eg: "/Users/JoeCool"). 
   * NOTE:  Relative paths will slide through this function untouched: 
   * this function does not necessarily return an absolute path! */
  public static resolveHomeDir(pathName: string): string {
    if (pathName.startsWith("~")) { 
      return path.join(os.homedir(), pathName.slice(2));
    } else {
      return pathName;
    } 
  }
}