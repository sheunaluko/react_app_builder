var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as hyperloop from "../hyperloop/index";
import * as common from "../../common/util/index"; //common utilities  
import * as ls from "./local_storage";
let log = common.Logger("nccih_herbs");
let hlm = hyperloop.main;
let fp = common.fp;
let debug = common.debug;
var url = "https://www.nccih.nih.gov/health/herbsataglance";
export function get_herbs() {
    return __awaiter(this, void 0, void 0, function* () {
        let html = yield hlm.http(url, {});
        let a_els = Array.from(html.querySelectorAll(".herbsul a"));
        let herbs = a_els.map(function (a) {
            let tmp = a.href.split("/");
            let lst = fp.last(tmp);
            return {
                'name': a.innerText.trim(),
                'link': url.replace("herbsataglance", lst)
            };
        });
        return herbs;
    });
}
function p_to_array(p) {
    return p.innerText.split(":")[1].trim().split(",");
}
function parse_info_el_row(div) {
    let title = div.querySelector("h2").innerText;
    let points = Array.from(div.querySelectorAll("li")).map((el) => el.innerText);
    return { title, points };
}
export function get_info_for_herb(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let html = yield hlm.http(url, {});
        let els = Array.from(html.querySelectorAll("main > .row"));
        let name = els[0].innerText.trim();
        let ps = Array.from(els[2].querySelectorAll("p"));
        let common_names = p_to_array(ps[0]);
        let latin_names = p_to_array(ps[1]);
        let info_el = els[3];
        let info_els = Array.from(info_el.querySelectorAll(".row > .col > .row > .col > .row"));
        let herb_info = {
            'name': name,
            'Common Names': common_names,
            'Latin Names': latin_names,
            'img_src': html.querySelector("figure img").src
        };
        for (var i = 0; i < 4; i++) {
            let { title, points } = parse_info_el_row(info_els[i]);
            herb_info[title] = points;
        }
        return herb_info;
    });
}
export function get_and_cache_herb_data(lsk) {
    return __awaiter(this, void 0, void 0, function* () {
        let herb_links = fp.map_get(yield get_herbs(), "link");
        // get promises for the actual data
        let promises = herb_links.map(get_info_for_herb);
        // wait for all of them 
        log("Waiting for all links..");
        let results = yield window.Promise.all(promises);
        //cache it before returning 
        ls.store_t(results, lsk);
        log("cached results: " + lsk);
        return results;
    });
}
export function get_all_herb_data() {
    return __awaiter(this, void 0, void 0, function* () {
        let lsk = "nccih.herbal_data";
        let msg = ls.get_t(lsk);
        if (msg) {
            //could potentially be old... will update it if >24 hours old 
            let { timestamp, data } = msg;
            let now = Number(new Date());
            let days_since_access = (now - timestamp) / 1000 / 60 / 60 / 24;
            if (days_since_access <= 1) {
                //return the cached copy 
                log("Returning cached herbal data");
                return data;
            }
            else {
                log("Cached herbal data is old so will re-request");
                return get_and_cache_herb_data(lsk);
            }
        }
        else {
            log("No cached herbal data, will request");
            return get_and_cache_herb_data(lsk);
        }
    });
}
//# sourceMappingURL=nccih_herbs.js.map