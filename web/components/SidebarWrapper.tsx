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
                standaloneMode: false,
                keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
                communityKey: process.env.NEXT_PUBLIC_COMMUNITY_KEY || 'iam-community',
                requireAuthentication: true,
                devMode: {
                    enabled: true,
                    user: {
                        id: 'dev-user',
                        username: 'devuser',
                        email: 'dev@example.com',
                        first_name: 'Dev',
                        last_name: 'User',
                        full_name: 'Dev User',
                        is_admin: true,
                        initials: 'DU',
                    },
                    plugins: [
                        {
                            id: 'dev-plugin-1',
                            name: 'My Plugin',
                            slug: 'dev-plugin-1',
                            base_path: '',
                            relative_path: '/my-plugin',
                            display_section: 'COMMUNITY',
                            activate: true,
                            shortcuts: [
                                { id: 'sc-1', name: 'Overview', slug: 'overview', url_path: '/my-plugin/overview' },
                                { id: 'sc-2', name: 'Settings', slug: 'settings', url_path: '/my-plugin/settings' },
                            ],
                        },
                        {
                            id: 'dev-admin',
                            name: 'Admin Panel',
                            slug: 'static-admin-panel',
                            base_path: '',
                            relative_path: '/internal/api/admin',
                            display_section: 'ADMIN',
                            plugin_view: 'EXT_LINK',
                            shortcuts: [],
                            activate: true,
                        },
                    ],
                },
            }}
        />
    );
}
