'use client';
export function useSpeech(){return (text:string)=>{try{const s=window.speechSynthesis;s.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.86;u.pitch=1;u.volume=1;s.speak(u)}catch{}}}
