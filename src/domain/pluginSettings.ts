export type PluginSettings = {
    daysToSuppressNewUpdates: number;
    dismissedVersionsByPluginId: Record<string, PluginDismissedVersions>;
    excludeDisabledPlugins: boolean;
    showIconOnMobile: boolean;
};

export type PluginDismissedVersions = {
    pluginId: string;
    pluginRepoPath: string;
    dismissedVersions: DismissedPluginVersion[];
};

export type DismissedPluginVersion = {
    versionNumber: string;
    versionName: string;
    publishedAt: string;
};

export const DEFAULT_PLUGIN_SETTINGS: PluginSettings = {
    daysToSuppressNewUpdates: 0,
    dismissedVersionsByPluginId: {},
    showIconOnMobile: true,
    excludeDisabledPlugins: false,
};
