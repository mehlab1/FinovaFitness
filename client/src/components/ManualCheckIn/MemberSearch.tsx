import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Member, MemberSearchProps } from '../../types/checkIn';

const MemberSearch: React.FC<MemberSearchProps> = ({
  value,
  onSearch,
  onMemberSelect,
  isLoading,
  members = [],
  placeholder = "Search by name, email, or member ID...",
  disabled = false,
  className = ""
}) => {
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < (members?.length || 0) - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && members && members[selectedIndex]) {
        handleMemberSelect(members[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  const handleMemberSelect = (member: Member) => {
    onMemberSelect(member);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 300);
  };

  return (
    <div className="relative">
      <Label htmlFor="member-search">Search Member</Label>
      <Input
        id="member-search"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowResults(true)}
        onBlur={handleInputBlur}
        disabled={disabled}
        className={`w-full ${className}`}
      />

      {showResults && (value.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              Searching...
            </div>
          ) : (members && members.length > 0) ? (
            <div className="py-1">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-gray-100' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMemberSelect(member);
                  }}
                >
                  <div className="font-medium">{member.full_name}</div>
                  <div className="text-sm text-gray-600">{member.email}</div>
                  <div className="text-xs text-gray-500">
                    {member.membership_status} - {member.loyalty_points} points
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              No members found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberSearch;
