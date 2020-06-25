

/* 
A module that can be used by all the 'meta' apps 
for super easily sharing their state 
*/

declare var window  : any ; 

window.state = {} 


export function register(s : string, val : any) : void { 
    window.state[s] = val 
} 

export function get(s : string) : any { 
    return window.state[s] 
} 
