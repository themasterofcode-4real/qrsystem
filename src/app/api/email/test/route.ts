export const runtime = 'nodejs';
import { NextResponse } from 'next/server';import { sendAccessEmail } from '@/lib/email';
export async function POST(){const r=await sendAccessEmail({result:'GRANTED',name:'Test User',id:0,role:'Diagnostics',department:'System',location:'TEST',reason:'',timestamp:new Date().toISOString()});return NextResponse.json({ok:true,result:r});}
