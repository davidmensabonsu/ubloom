import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore, UserProfile } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';

const DEBOUNCE_MS = 2000;

export function useCloudSync() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUserStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingFromCloud = useRef(false);
  const hasLoadedFromCloud = useRef(false);
  const lastSavedJson = useRef<string>('');
  const [cloudSyncLoaded, setCloudSyncLoaded] = useState(false);
  // Load from cloud on login
  useEffect(() => {
    if (!user) {
      hasLoadedFromCloud.current = false;
      lastSavedJson.current = '';
      setCloudSyncLoaded(false);
      return;
    }

    const loadFromCloud = async () => {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Cloud sync load error:', error);
          return;
        }

        if (data?.data && typeof data.data === 'object') {
          isSyncingFromCloud.current = true;
          const cloudProfile = data.data as Partial<UserProfile>;
          updateProfile(cloudProfile);
          lastSavedJson.current = JSON.stringify(cloudProfile);
          setTimeout(() => {
            isSyncingFromCloud.current = false;
          }, 100);
        }

        hasLoadedFromCloud.current = true;
        setCloudSyncLoaded(true);
      } catch (err) {
        console.error('Cloud sync load failed:', err);
        hasLoadedFromCloud.current = true;
        setCloudSyncLoaded(true);
      }
    };

    loadFromCloud();
  }, [user]);

  // Save to cloud on profile changes (debounced)
  const saveToCloud = useCallback(async (profileData: UserProfile) => {
    if (!user || !hasLoadedFromCloud.current) return;

    const json = JSON.stringify(profileData);
    if (json === lastSavedJson.current) return;

    try {
      const { error } = await supabase
        .from('user_data')
        .upsert(
          { user_id: user.id, data: profileData as unknown as import('@/integrations/supabase/types').Json },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Cloud sync save error:', error);
      } else {
        lastSavedJson.current = json;
      }
    } catch (err) {
      console.error('Cloud sync save failed:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user || isSyncingFromCloud.current || !hasLoadedFromCloud.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToCloud(profile);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [profile, user, saveToCloud]);
}
