"use strict";
/**
 * Wise Profile Auto-Fetch Utility
 *
 * Automatically fetches and saves profile ID when API key is saved
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndSaveWiseProfile = fetchAndSaveWiseProfile;
const wise_1 = require("./wise");
const config_1 = require("../core/config");
async function fetchAndSaveWiseProfile(providerName, apiKey, environment = 'sandbox') {
    // Create temporary client to fetch profile
    const client = new wise_1.WiseClient({
        name: providerName,
        apiKey,
        environment: environment
    });
    try {
        // Get profiles from Wise API
        const profiles = await client.getProfiles();
        if (!profiles || profiles.length === 0) {
            throw new Error('No profiles found for this Wise account');
        }
        // Use first profile (personal or business)
        const profile = profiles[0];
        const profileId = profile.id.toString();
        // Update config with profile ID
        config_1.configManager.setProvider(providerName, {
            name: providerName,
            apiKey,
            environment: environment,
            profileId
        });
        console.log(`✓ Auto-fetched Wise Profile ID: ${profileId} (${profile.type})`);
        return profileId;
    }
    catch (error) {
        console.error('Failed to fetch Wise profile:', error.message);
        throw error;
    }
}
//# sourceMappingURL=wise-profile.js.map