export const runtime = 'nodejs';
import { NextResponse } from 'next/server';import { listLogs } from '@/lib/db';
export async function GET(req:Request){try{const u=new URL(req.url);return NextResponse.json({ok:true,logs:listLogs({search:u.searchParams.get('search')||'',eventType:u.searchParams.get('eventType')||''})});}catch{return NextResponse.json({ok:false,logs:[]},{status:500});}}
