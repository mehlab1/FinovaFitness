import React, { useState, useEffect } from 'react';
import { monthlyPlanApi, MonthlyPlan, CreateMonthlyPlanData } from '../../services/api/monthlyPlanApi';
import { useToast } from '../Toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Users, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface MonthlyPlanManagementProps {
  trainerId: number;
}

export const MonthlyPlanManagement: React.FC<MonthlyPlanManagementProps> = ({ trainerId }) => {
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MonthlyPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateMonthlyPlanData>({
    trainer_id: trainerId,
    plan_name: '',
    monthly_price: 0,
    sessions_per_month: 8,
    session_duration: 60,
    session_type: 'personal',
    max_subscribers: 1,
    description: ''
  });

  // Load plans on component mount
  useEffect(() => {
    loadPlans();
  }, [trainerId]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      console.log('Loading plans for trainer ID:', trainerId);
      const response = await monthlyPlanApi.getTrainerMonthlyPlans(trainerId);
      console.log('Plans loaded successfully:', response.data);
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to load monthly plans:', error);
      showToast('Failed to load monthly plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMonthlyPlanData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      trainer_id: trainerId,
      plan_name: '',
      monthly_price: 0,
      sessions_per_month: 8,
      session_duration: 60,
      session_type: 'personal',
      max_subscribers: 1,
      description: ''
    });
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      console.log('Submitting plan with data:', formData);
      
      if (editingPlan) {
        // Update existing plan
        await monthlyPlanApi.updateMonthlyPlan(editingPlan.id, formData);
        showToast('Monthly plan updated successfully!', 'success');
      } else {
        // Create new plan
        const result = await monthlyPlanApi.createMonthlyPlan(formData);
        console.log('Plan created successfully:', result);
        showToast('Monthly plan created successfully! Pending admin approval.', 'success');
      }
      
      setShowCreateForm(false);
      resetForm();
      loadPlans();
      
    } catch (error) {
      console.error('Failed to save monthly plan:', error);
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to save monthly plan';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: MonthlyPlan) => {
    setEditingPlan(plan);
    setFormData({
      trainer_id: trainerId,
      plan_name: plan.plan_name,
      monthly_price: plan.monthly_price,
      sessions_per_month: plan.sessions_per_month,
      session_duration: plan.session_duration,
      session_type: plan.session_type,
      max_subscribers: plan.max_subscribers,
      description: plan.description || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (planId: number, planName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await monthlyPlanApi.deleteMonthlyPlan(planId);
      showToast('Monthly plan deleted successfully!', 'success');
      loadPlans();
    } catch (error) {
      console.error('Failed to delete monthly plan:', error);
      showToast('Failed to delete monthly plan', 'error');
    }
  };

  const getStatusBadge = (plan: MonthlyPlan) => {
    if (!plan.is_active) {
      return <Badge variant="secondary" className="bg-gray-500 text-white">Inactive</Badge>;
    }
    
    if (plan.requires_admin_approval && !plan.admin_approved) {
      return <Badge variant="secondary" className="bg-yellow-500 text-white">Pending Approval</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500 text-white">Active</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading monthly plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
          Monthly Plans
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto">
          Create and manage your monthly training packages. Members can subscribe to these plans for recurring sessions.
        </p>
      </div>

      {/* Create Plan Button */}
      <div className="text-center">
        <Button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl transform hover:scale-105 transition-all"
        >
          <Plus className="w-6 h-6 mr-3" />
          Create New Monthly Plan
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <Zap className="w-6 h-6 mr-3 text-pink-400" />
              {editingPlan ? 'Edit Monthly Plan' : 'Create New Monthly Plan'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {editingPlan ? 'Update your monthly plan details' : 'Set up a new monthly training package'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Name */}
                <div className="space-y-2">
                  <Label htmlFor="plan_name" className="text-gray-300 font-medium">
                    Plan Name *
                  </Label>
                  <Input
                    id="plan_name"
                    type="text"
                    value={formData.plan_name}
                    onChange={(e) => handleInputChange('plan_name', e.target.value)}
                    placeholder="e.g., Personal Training Package"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                {/* Monthly Price */}
                <div className="space-y-2">
                  <Label htmlFor="monthly_price" className="text-gray-300 font-medium">
                    Monthly Price ($) *
                  </Label>
                  <Input
                    id="monthly_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => handleInputChange('monthly_price', parseFloat(e.target.value) || 0)}
                    placeholder="200.00"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                {/* Sessions Per Month */}
                <div className="space-y-2">
                  <Label htmlFor="sessions_per_month" className="text-gray-300 font-medium">
                    Sessions Per Month *
                  </Label>
                  <Input
                    id="sessions_per_month"
                    type="number"
                    min="1"
                    value={formData.sessions_per_month}
                    onChange={(e) => handleInputChange('sessions_per_month', parseInt(e.target.value) || 0)}
                    placeholder="8"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                {/* Session Duration */}
                <div className="space-y-2">
                  <Label htmlFor="session_duration" className="text-gray-300 font-medium">
                    Session Duration (minutes)
                  </Label>
                  <Select
                    value={formData.session_duration?.toString()}
                    onValueChange={(value) => handleInputChange('session_duration', parseInt(value))}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="30" className="text-white hover:bg-gray-700">30 minutes</SelectItem>
                      <SelectItem value="45" className="text-white hover:bg-gray-700">45 minutes</SelectItem>
                      <SelectItem value="60" className="text-white hover:bg-gray-700">60 minutes</SelectItem>
                      <SelectItem value="75" className="text-white hover:bg-gray-700">75 minutes</SelectItem>
                      <SelectItem value="90" className="text-white hover:bg-gray-700">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Session Type */}
                <div className="space-y-2">
                  <Label htmlFor="session_type" className="text-gray-300 font-medium">
                    Session Type
                  </Label>
                  <Select
                    value={formData.session_type}
                    onValueChange={(value) => handleInputChange('session_type', value as 'personal' | 'group')}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="personal" className="text-white hover:bg-gray-700">Personal Training</SelectItem>
                      <SelectItem value="group" className="text-white hover:bg-gray-700">Group Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Subscribers */}
                <div className="space-y-2">
                  <Label htmlFor="max_subscribers" className="text-gray-300 font-medium">
                    Max Subscribers
                  </Label>
                  <Input
                    id="max_subscribers"
                    type="number"
                    min="1"
                    value={formData.max_subscribers}
                    onChange={(e) => handleInputChange('max_subscribers', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what's included in this monthly plan..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {editingPlan ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-pink-400" />
          Your Monthly Plans ({plans.length})
        </h2>

        {plans.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Monthly Plans Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first monthly plan to start offering recurring training packages to members.
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-white mb-2">{plan.plan_name}</CardTitle>
                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusBadge(plan)}
                        <Badge variant="outline" className="border-gray-500 text-gray-300">
                          {plan.session_type === 'personal' ? 'Personal' : 'Group'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan.id, plan.plan_name)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(plan.monthly_price)}</p>
                      <p className="text-sm text-gray-400">per month</p>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-lg font-semibold text-white">{plan.sessions_per_month} sessions</p>
                      <p className="text-sm text-gray-400">per month</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-lg font-semibold text-white">{plan.session_duration} minutes</p>
                      <p className="text-sm text-gray-400">per session</p>
                    </div>
                  </div>

                  {/* Max Subscribers */}
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-pink-400" />
                    <div>
                      <p className="text-lg font-semibold text-white">Max {plan.max_subscribers}</p>
                      <p className="text-sm text-gray-400">subscribers</p>
                    </div>
                  </div>

                  {/* Description */}
                  {plan.description && (
                    <div className="pt-3 border-t border-gray-600">
                      <p className="text-sm text-gray-300">{plan.description}</p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400">
                      Created: {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
