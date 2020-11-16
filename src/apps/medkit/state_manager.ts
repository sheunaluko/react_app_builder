

/* 
A module for sharing state  
*/

declare var window  : any ; 

window.state_manager = {} 


export function register(s : string, val : any) : void { 
    window.state_manager[s] = val 
} 

export function get(s : string) : any { 
    return window.state_manager[s]  
} 
