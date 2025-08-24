import React, { useState, useCallback } from 'react';
import { useMemberSearch } from '../../hooks/useMemberSearch';
import { useCheckIn } from '../../hooks/useCheckIn';
import { useRecentCheckIns } from '../../hooks/useRecentCheckIns';
import MemberSearch from './MemberSearch';
import RecentCheckIns from './RecentCheckIns';
import CheckInModal from './CheckInModal';
import { Member, CheckInData } from '../../types/checkIn';
import { useToast } from '../../hooks/use-toast';

interface ManualCheckInFormProps {
  className?: string;
}

export const ManualCheckInForm: React.FC<ManualCheckInFormProps> = ({ className = '' }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const { members, isLoading: searchLoading, error: searchError, searchMembers, clearResults } = useMemberSearch();
  const { checkInMember, isLoading: checkInLoading, error: checkInError, clearError } = useCheckIn();
  const { checkIns, isLoading: recentLoading, error: recentError, refresh } = useRecentCheckIns();

  // Handle member search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim().length >= 2) {
      searchMembers(term);
    } else {
      clearResults();
    }
  }, [searchMembers, clearResults]);

  // Handle member selection
  const handleMemberSelect = useCallback((member: Member) => {
    setSelectedMember(member);
    setSearchTerm(`${member.first_name} ${member.last_name}`);
    clearResults();
  }, [clearResults]);

  // Handle check-in confirmation
  const handleCheckInConfirm = useCallback(async () => {
    if (!selectedMember) return;

    const checkInData: CheckInData = {
      user_id: selectedMember.id,
      check_in_time: new Date().toISOString(), // Keep ISO string for backend processing
      check_in_type: 'manual'
    };

    try {
      const result = await checkInMember(checkInData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully checked in ${selectedMember.first_name} ${selectedMember.last_name}`,
          variant: "default",
        });
        
        // Reset form
        setSelectedMember(null);
        setSearchTerm('');
        setIsModalOpen(false);
        
        // Refresh recent check-ins
        refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to check in member',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'An error occurred during check-in',
        variant: "destructive",
      });
    }
  }, [selectedMember, checkInMember, toast, refresh]);

  // Handle check-in button click
  const handleCheckInClick = useCallback(() => {
    if (selectedMember) {
      setIsModalOpen(true);
    } else {
      toast({
        title: "Warning",
        description: 'Please select a member first',
        variant: "destructive",
      });
    }
  }, [selectedMember, toast]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedMember(null);
    setSearchTerm('');
    clearResults();
  }, [clearResults]);

  // Handle error clearing
  const handleErrorClear = useCallback(() => {
    if (searchError) clearError();
    if (checkInError) clearError();
    if (recentError) clearError();
  }, [searchError, checkInError, recentError, clearError]);

  return (
    <div className={`manual-checkin-form ${className}`}>
      {/* Header */}
      <div className="form-header">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manual Check-In</h2>
        <p className="text-gray-600 mb-6">
          Search for active members and record their check-ins. Members can be checked in multiple times per day.
        </p>
      </div>

      {/* Error Display */}
      {(searchError || checkInError || recentError) && (
        <div className="error-banner mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-red-700 text-sm">
              {searchError || checkInError || recentError}
            </span>
            <button
              onClick={handleErrorClear}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search and Check-in Section */}
      <div className="search-section mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Search */}
          <div className="lg:col-span-2">
            <label htmlFor="member-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Members
            </label>
            <MemberSearch
              value={searchTerm}
              onSearch={handleSearch}
              onMemberSelect={handleMemberSelect}
              isLoading={searchLoading}
              members={members}
              placeholder="Search by name, email, or member ID..."
            />
          </div>

          {/* Check-in Button */}
          <div className="flex items-end">
            <button
              onClick={handleCheckInClick}
              disabled={!selectedMember || checkInLoading}
              className={`w-full px-6 py-3 rounded-md font-medium transition-colors ${
                selectedMember && !checkInLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {checkInLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking In...
                </div>
              ) : (
                'Check In Member'
              )}
            </button>
          </div>
        </div>

        {/* Selected Member Display */}
        {selectedMember && (
          <div className="selected-member mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">
                  {selectedMember.first_name} {selectedMember.last_name}
                </h3>
                <p className="text-sm text-blue-700">{selectedMember.email}</p>
                <p className="text-sm text-blue-600">
                  Plan: {selectedMember.membership_plan} | Points: {selectedMember.loyalty_points}
                </p>
              </div>
              <button
                onClick={handleClearSelection}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Check-ins Section */}
      <div className="recent-checkins-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Check-ins</h3>
          <button
            onClick={refresh}
            disabled={recentLoading}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
          >
            {recentLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <RecentCheckIns
          checkIns={checkIns}
          isLoading={recentLoading}
          onRefresh={refresh}
        />
      </div>

      {/* Check-in Confirmation Modal */}
      <CheckInModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleCheckInConfirm}
        member={selectedMember}
        isLoading={checkInLoading}
      />
    </div>
  );
};

export default ManualCheckInForm;
