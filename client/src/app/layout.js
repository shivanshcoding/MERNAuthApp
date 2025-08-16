import './globals.css';
import { AuthProvider } from '@/context/authContext.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const metadata = {
    title: 'Auth App',
    description: 'Secure login/register system',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider><GoogleOAuthProvider clientId={googleClientId}>
                    {children}
                </GoogleOAuthProvider></AuthProvider>
            </body>
        </html>
    );
}