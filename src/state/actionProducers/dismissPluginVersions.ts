import { createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import filter from 'lodash/filter';
import find from 'lodash/find';
import {
    DismissedPluginVersion,
    PluginDismissedVersions,
    PluginSettings,
} from 'src/domain/pluginSettings';
import { groupById } from 'src/domain/util/groupById';
import { State } from '..';
import { ObsidianState } from '../obsidianReducer';
import { ReleaseState } from '../releasesReducer';

type Paramters = {
    selectedPluginVersions: SelectedPluginVersions;
    persistPluginSettings: (settings: PluginSettings) => Promise<void>;
};

export type SelectedPluginVersions = { pluginId: string; pluginVersionNumber: string }[];

export const dismissSelectedPluginVersions = createAsyncThunk(
    'releases/dismissPluginVersions',
    async (params: Paramters, thunkAPI) => {
        const state = thunkAPI.getState() as State;
        const obsidianState = state.obsidian as ObsidianState;
        const releaseState = state.releases as ReleaseState;

        const currentSettings: PluginSettings = obsidianState.settings;
        const pluginReleasesById = groupById(releaseState.releases, 'obsidianPluginId');
        const selectedPluginVersionsById = groupById(params.selectedPluginVersions, 'pluginId');
        const selectedPluginIds: string[] = Object.keys(selectedPluginVersionsById);

        const dismissedVersionsByPluginId: Record<string, PluginDismissedVersions> = {
            ...currentSettings.dismissedVersionsByPluginId,
        };

        for (const pluginId of selectedPluginIds) {
            const versionNumber = selectedPluginVersionsById[pluginId].pluginVersionNumber;
            const releases = pluginReleasesById[pluginId];
            const relesaeVersion = find(
                releases.newVersions,
                (releaseVersion) => releaseVersion.versionNumber === versionNumber
            );

            let pluginDismissedVersions: PluginDismissedVersions = dismissedVersionsByPluginId[
                pluginId
            ] || {
                pluginRepoPath: releases.pluginRepoPath,
                dismissedVersions: [],
            };

            const dismissedVersionsWithoutSelected: DismissedPluginVersion[] =
                filter(
                    pluginDismissedVersions.dismissedVersions,
                    (dismissedVersion) => dismissedVersion.versionNumber !== versionNumber
                ) || [];
            const dismissedVersion: DismissedPluginVersion = {
                versionNumber,
                versionName: relesaeVersion?.versionName || versionNumber,
                publishedAt: relesaeVersion?.publishedAt || dayjs().format(),
            };
            dismissedVersionsByPluginId[pluginId] = {
                ...pluginDismissedVersions,
                dismissedVersions: [dismissedVersion, ...dismissedVersionsWithoutSelected],
            };
        }

        const updatedSettings: PluginSettings = {
            ...obsidianState.settings,
            dismissedVersionsByPluginId,
        };
        await params.persistPluginSettings(updatedSettings);
    }
);
