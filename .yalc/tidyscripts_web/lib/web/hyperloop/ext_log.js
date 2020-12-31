/*
 Hyperloop External Logger Base interface
 */
import * as wutil from "../util/index";
export var ext_logger = new wutil.ExternalLogger("HL"); //creates an external logger interface 
export var ext_log = ext_logger.log.bind(ext_logger);
export var set_ext_log = ext_logger.set_logger.bind(ext_logger);
//# sourceMappingURL=ext_log.js.map