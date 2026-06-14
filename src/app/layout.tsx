import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title:'QR Access Kiosk', description:'Browser-based QR access kiosk' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
