

import cryptojs from "crypto-js" 


var AES = cryptojs.AES 

 
declare var window : any ; 
window.AES = AES ; 


export function encrypt(message : string, key : string) {
    return AES.encrypt(message, key).toString();
} 

export function decrypt(ciphertext : string , key : string) { 
    // Decrypt
    var bytes  = AES.decrypt(ciphertext, key);
    var originalText = bytes.toString(cryptojs.enc.Utf8);
    return originalText 
} 
 
 
window.mCrypto = { 
    encrypt, 
    decrypt
} 
