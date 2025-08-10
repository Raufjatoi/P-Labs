import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface DashboardStats {
  modelsCreated: number;
  streamlitApps: number;
  downloads: number;
}

export interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    modelsCreated: 0,
    streamlitApps: 0,
    downloads: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch model generations stats
        const { data: models, error: modelsError } = await supabase
          .from('model_generations')
          .select('is_streamlit, downloaded')
          .eq('user_id', user.id);

        if (modelsError) throw modelsError;

        // Calculate stats from models
        const totalModels = models?.length || 0;
        const streamlitApps = models?.filter(m => m.is_streamlit).length || 0;
        const downloads = models?.filter(m => m.downloaded).length || 0;

        setStats({
          modelsCreated: totalModels,
          streamlitApps,
          downloads
        });

        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        if (activityError) throw activityError;

        setActivities(activityData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return { stats, activities, loading };
};