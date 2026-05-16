import React from 'react';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicNavbar />
            <main className="flex-grow" style={{ marginTop: '80px' }}>
                {children}
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
