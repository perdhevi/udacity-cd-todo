/*import request from 'request';
import { JwksError, SigningKeyNotFoundError } from './errors';

//import { certToPEM } from './utils';


export class JwksClient {
   
    options:any;
    constructor (options) {
        this.options = {strictSsl:true,  ...options};

    };


    certToPEM(cert) {
        cert = cert.match(/.{1,64}/g).join('\n');
        cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
        return cert;
    };
}

*/