/**
 * Wise Profile Auto-Fetch Utility
 * 
 * Automatically fetches and saves profile ID when API key is saved
 */

import { WiseClient } from './wise';
import { configManager } from '../core/config';

export async function fetchAndSaveWiseProfile(providerName: string, apiKey: string, environment: string = 'sandbox'): Promise<string> {
  // Create temporary client to fetch profile
  const client = new WiseClient({
    name: providerName,
    apiKey,
    environment: environment as any
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
    configManager.setProvider(providerName, {
      name: providerName,
      apiKey,
      environment: environment as 'sandbox' | 'production',
      profileId
    });

    console.log(`✓ Auto-fetched Wise Profile ID: ${profileId} (${profile.type})`);
    return profileId;

  } catch (error: any) {
    console.error('Failed to fetch Wise profile:', error.message);
    throw error;
  }
}
