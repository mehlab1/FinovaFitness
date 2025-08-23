import { useState, useEffect, useCallback } from 'react';
import frontDeskApi from '../services/frontDeskApi';

export interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseMembershipPlansReturn {
  plans: MembershipPlan[];
  loading: boolean;
  error: string | null;
  selectedPlan: MembershipPlan | null;
  setSelectedPlan: (plan: MembershipPlan | null) => void;
  refreshPlans: () => Promise<void>;
  getPlanById: (id: number) => MembershipPlan | undefined;
}

export const useMembershipPlans = (): UseMembershipPlansReturn => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await frontDeskApi.getMembershipPlans();
      setPlans(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch membership plans';
      setError(errorMessage);
      console.error('Error fetching membership plans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPlans = useCallback(async () => {
    await fetchPlans();
  }, [fetchPlans]);

  const getPlanById = useCallback((id: number): MembershipPlan | undefined => {
    return plans.find(plan => plan.id === id);
  }, [plans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    selectedPlan,
    setSelectedPlan,
    refreshPlans,
    getPlanById,
  };
};

export default useMembershipPlans;
