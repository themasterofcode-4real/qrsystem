export type UserRecord={name:string;id:number;role:string;department:string};
export const USERS:Record<string,UserRecord>={
 JOSEPHROYALTY:{name:'Dr. Joseph Royalty, M.D., PhD',id:4,role:'Surgeon',department:'Cardiology'},
 DONNASMITH:{name:'Donna Jean Negri-Smith',id:1,role:'Department of Household Enforcement',department:'Leadership'},
 GREGORYSMITH:{name:'Gregory Vaun Smith',id:2,role:'Lead Recreation and Entertainment Officer',department:'Recreation'},
 JOSEPHNEGRI:{name:'Joseph Paul Negri Junior',id:3,role:'Medical and Technical Support',department:'IT'},
};
export const DESTINATIONS=['LIVING_ROOM','BATHROOM','MASTER_BEDROOM','KITCHEN','EXITING_HOUSE'] as const;
export type Destination=typeof DESTINATIONS[number];
export function parseQr(raw:string){const m=/^ID:(\d+)\|NAME:([A-Z0-9_]+)$/.exec(raw.trim());if(!m)return {ok:false as const,reason:'Invalid QR code scanned.'};const id=Number(m[1]);const key=m[2];const user=USERS[key];if(!user)return {ok:false as const,reason:'User not recognized.'};if(user.id!==id)return {ok:false as const,reason:'Invalid QR code scanned.'};return {ok:true as const,key,user};}
export function evaluateAccess(location:string,now=new Date()){if(!DESTINATIONS.includes(location as Destination))return {result:'DENIED' as const,reason:'Invalid location selected.'};if(location==='KITCHEN'){const s=now.getHours()*3600+now.getMinutes()*60+now.getSeconds();if(s>=20*3600||s<=5*3600+59*60+59)return {result:'DENIED' as const,reason:'Kitchen access restricted between 8 PM and 6 AM.'};}return {result:'GRANTED' as const,reason:''};}
