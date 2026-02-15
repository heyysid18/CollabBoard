import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: '#16181d',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '13px',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    }
                }
            }}
        />
    );
};
