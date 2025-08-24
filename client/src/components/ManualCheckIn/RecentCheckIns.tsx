import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Calendar, Clock } from 'lucide-react';
import { CheckIn, RecentCheckInsProps } from '../../types/checkIn';

const RecentCheckIns: React.FC<RecentCheckInsProps> = ({
  checkIns,
  isLoading,
  onRefresh,
  limit = 10,
  autoRefresh = true,
  showFilters = true,
  className = ""
}) => {
  const [filter, setFilter] = useState('all'); // all, today, this-week
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  const filteredCheckIns = checkIns.filter(checkIn => {
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return checkIn.visit_date === today;
    }
    if (filter === 'this-week') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const checkInDate = new Date(checkIn.visit_date);
      return checkInDate >= weekStart;
    }
    return true;
  });

  const sortedCheckIns = [...filteredCheckIns].sort((a, b) => {
    const dateA = new Date(`${a.visit_date} ${a.check_in_time}`);
    const dateB = new Date(`${b.visit_date} ${b.check_in_time}`);
    return sortBy === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Check-ins</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : sortedCheckIns.length > 0 ? (
          <div className="space-y-3">
            {sortedCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <div className="font-medium">{checkIn.member_name}</div>
                    <div className="text-sm text-gray-600">{checkIn.member_email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(checkIn.visit_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(checkIn.check_in_time)}</span>
                  </div>
                  <Badge variant={checkIn.check_in_type === 'manual' ? 'default' : 'secondary'}>
                    {checkIn.check_in_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No check-ins found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCheckIns;
