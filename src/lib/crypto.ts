import crypto from 'crypto';
const FALLBACK='development-only-32-byte-fallback-key';
function key(){return crypto.createHash('sha256').update(process.env.LOG_ENCRYPTION_KEY||FALLBACK).digest();}
export function encryptText(text:string){const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);const enc=Buffer.concat([cipher.update(text,'utf8'),cipher.final()]);const tag=cipher.getAuthTag();return Buffer.concat([iv,tag,enc]).toString('base64');}
export function decryptText(payload:string){const b=Buffer.from(payload,'base64');const iv=b.subarray(0,12);const tag=b.subarray(12,28);const enc=b.subarray(28);const decipher=crypto.createDecipheriv('aes-256-gcm',key(),iv);decipher.setAuthTag(tag);return Buffer.concat([decipher.update(enc),decipher.final()]).toString('utf8');}
