import * as React from 'react';import { twMerge } from 'tailwind-merge';
export function Button({className,...props}:React.ButtonHTMLAttributes<HTMLButtonElement>){return <button className={twMerge('rounded-2xl px-6 py-4 font-bold shadow active:scale-95 disabled:opacity-40',className)} {...props}/>}
