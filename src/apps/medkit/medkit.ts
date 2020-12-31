import * as tsw from "tidyscripts_web";
import  * as _smgr from "./state_manager" 


//probably a slightly better way to do these exports 
export var  smgr  = _smgr 

let hlm = tsw.hyperloop.main;
let hl_external_logger = tsw.hyperloop.external_logger
let fp = tsw.util.common.fp;
let asnc = tsw.util.common.asnc 
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let debug = tsw.util.common.debug;
declare var window: any;


// --- 

export function log(msg : string) { 
    console.log("[mk]:: " + msg) 
} 


/*
  Attach the hyperloop logger to the ui logger
*/

export async function configure_logger() { 
    hl_external_logger.set_ext_log( 
	function(msg: any) {
	    let f = _smgr.get("addConsoleText") 
	    if (f) {
		f(msg) 
	    } else { 
		console.log("mk,hl:: ui not ready") 
	    } 
	} 
    )  
    log("Wired the hyperloop extenal logger to the console output") 
    //wait for it to be ready 
    let _  = await asnc.wait_until ( ()=> _smgr.get("addConsoleText") , 8000, 200 ) 
} 
  

export async function init() { 
    
    log ("Initing medkit") 
    
    //init medkit stuff 
    log("Configuring logger") 
    await configure_logger() 
    
    log("Requesting wikidata medical predicates") 
    // get the wiki data api ready 
    wikidata.all_predicates() 
} 


init()  // do the medkit init, asynchronously :)  

export async function get_http(url : string,args : any = {}) {
    return (await hlm.http(url,args)) 
} 


const documentation_base = "https://alukosheun.gitbook.io/medkit/documentation/components/" 


export async function get_documentation(name : string) { 
    let url = documentation_base + name 
    return get_http(url)
} 


export async function define(vname : string, f : any ) {
    let result = await f  
    window[vname] = result 
    log("Defined: " + vname) 
} 

export function create_iframe(id:string) {
    let i =  document.createElement('iframe') 
    return i 
} 


export function set_html_of_iframe(fr : any, html : string) { 
    fr.src = "data:text/html;charset=utf-8," + escape(html);  
    return fr 
} 
