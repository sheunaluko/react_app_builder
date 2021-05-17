import { params } from "./params";
export function Logger(name) {
    return function (v) {
        if (params.suppress_log) {
            if (!params.log_pass.includes(name)) {
                return;
            }
        }
        if (typeof v === "object") {
            console.log(`[${name}]::`);
            console.log(v);
        }
        else {
            console.log(`[${name}]:: ${v}`);
        }
    };
}
//# sourceMappingURL=logger.js.map