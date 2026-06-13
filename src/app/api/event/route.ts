export const runtime = 'nodejs';
import { NextResponse } from 'next/server';import { addLog } from '@/lib/db';
const allowed=new Set(['startup','shutdown','camera failure','invalid QR','unknown user','admin logout','admin login']);
export async function POST(req:Request){try{const {eventType,body}=await req.json();const type=String(eventType||'');if(!allowed.has(type))return NextResponse.json({ok:false},{status:400});addLog({eventType:type,body:String(body||type)});return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false},{status:500});}}
