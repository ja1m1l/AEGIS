"use client";

import React from 'react';
import ProfileTab from '@/components/tabs/ProfileTab';
import { useAppContext } from '@/components/AppProvider';
import { logout } from '@/actions/auth';

export default function ProfilePage() {
    const { isDark } = useAppContext();
    // const router = useRouter(); // router is not needed if we use server action redirect, but might remain for other things if needed. Actually it's cleaner to just let the action handle redirect.

    const handleLogout = async () => {
        await logout();
    };

    return <ProfileTab isDark={isDark} onLogout={handleLogout} />;
}
