import Database from 'better-sqlite3';import fs from 'fs';import path from 'path';import { decryptText, encryptText } from './crypto';
const dbPath=process.env.SQLITE_PATH||path.join(process.cwd(),'data','qrsystem.sqlite');fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const db=new Database(dbPath);db.pragma('journal_mode = WAL');db.exec(`CREATE TABLE IF NOT EXISTS logs(id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL, event_type TEXT NOT NULL, encrypted_body TEXT NOT NULL);CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(timestamp);`);
export type LogInput={eventType:string;body:string;timestamp?:Date};
export function addLog({eventType,body,timestamp=new Date()}:LogInput){const ts=timestamp.toISOString();db.prepare('INSERT INTO logs(timestamp,event_type,encrypted_body) VALUES(?,?,?)').run(ts,eventType,encryptText(body));return {timestamp:ts};}
export function listLogs(q?:{search?:string;eventType?:string}){const rows=db.prepare('SELECT id,timestamp,event_type,encrypted_body FROM logs ORDER BY id DESC LIMIT 500').all() as any[];return rows.map(r=>({id:r.id,timestamp:r.timestamp,eventType:r.event_type,body:decryptText(r.encrypted_body)})).filter(r=>(!q?.eventType||r.eventType===q.eventType)&&(!q?.search||`${r.eventType} ${r.body}`.toLowerCase().includes(q.search.toLowerCase())));}
export function dbOk(){db.prepare('SELECT 1').get();return true;}
