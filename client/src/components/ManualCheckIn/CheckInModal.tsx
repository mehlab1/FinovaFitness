import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail, CreditCard } from 'lucide-react';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  membership_status: string;
  loyalty_points: number;
  membership_start_date: string;
  membership_end_date: string;
  full_name: string;
}

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: Member | null;
  isLoading?: boolean;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  isLoading = false
}) => {
  if (!member) return null;

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Check-In</DialogTitle>
          <DialogDescription>
            Please review the member details and check-in information before confirming.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Member Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Member Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{member.full_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{member.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{member.membership_status}</span>
                <Badge variant={member.membership_status === 'active' ? 'default' : 'secondary'}>
                  {member.membership_status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Loyalty Points: {member.loyalty_points}</span>
              </div>
            </div>
          </div>

          {/* Check-in Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Check-in Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{currentDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{currentTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Manual Check-in</Badge>
              </div>
            </div>
          </div>

          {/* Warning/Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              This will record a check-in for {member.full_name} at the current time. 
              Multiple check-ins per day are allowed.
            </p>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Checking In...' : 'Confirm Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInModal;
