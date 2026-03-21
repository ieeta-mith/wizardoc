'use client';

import { Sidebar, User, Plugin } from '@bioinformatics-ua/iam-sidebar';

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
            user?: User;
            plugins?: Plugin[];
        }
    };
}

export default function SidebarWrapper({ config }: SidebarWrapperProps) {
    const standaloneMode =
        process.env.NEXT_PUBLIC_STANDALONE_MODE?.toLowerCase() === 'true';

    const sidebarDevMode =
        process.env.NEXT_PUBLIC_SIDEBAR_DEV_MODE?.toLowerCase() === 'true';

    return (
        <Sidebar
            config={{
                collapsed: false,
                theme: 'dark',
                keyboardShortcuts: true,
                standaloneMode,
                keycloakUrl: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
                communityKey: process.env.NEXT_PUBLIC_COMMUNITY_KEY || 'iam-community',
                requireAuthentication: !(standaloneMode || sidebarDevMode),
                devMode: {
                    enabled: sidebarDevMode,
                },
                ...config,
            }}
        />
    );
}
