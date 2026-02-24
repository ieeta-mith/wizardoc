'use client';

import { useEffect, useState } from 'react';
import { Sidebar, User, Plugin} from '@bioinformatics-ua/iam-sidebar';

interface SidebarWrapperProps {
    config?: {
        collapsed?: boolean;
        theme?: 'dark' | 'light';
        keyboardShortcuts?: boolean;
        standaloneMode?: boolean;
        keycloakUrl?: string;
        communityKey?: string;
        requireAuthentication?: boolean;
        devMode?: {
            enabled: boolean;
            user: User;
            plugins: Plugin[];
        }
    };
}

export default function SidebarWrapper( config : SidebarWrapperProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Avoid hydration mismatch: sidebar reads persisted state from localStorage on the client.
        return <div className="w-16 shrink-0" aria-hidden="true" />;
    }

    return (
        <Sidebar
            config={{
                collapsed: false,
                theme: 'dark',
                keyboardShortcuts: true,
                standaloneMode: process.env.NEXT_PUBLIC_STANDALONE_MODE?.toLowerCase() === 'true',
                keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
                communityKey: process.env.NEXT_PUBLIC_COMMUNITY_KEY || 'iam-community',
                requireAuthentication: true,
                devMode: {
                    enabled: true
                },
        ...config,
            }}
        />
    );
}
