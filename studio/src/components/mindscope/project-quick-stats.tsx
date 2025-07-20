// src/components/mindscope/project-quick-stats.tsx
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import type { Project } from '@/lib/types';
import { getProjectStats, calculateProjectProgress } from '@/lib/services/progress-tracker';

interface ProjectQuickStatsProps {
  project: Project;
  className?: string;
}

export function ProjectQuickStats({ project, className = '' }: ProjectQuickStatsProps) {
  const stats = getProjectStats(project);
  const progress = calculateProjectProgress(project);
  
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency <= 1.1) return 'text-green-600';
    if (efficiency <= 1.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency <= 1.1) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (efficiency <= 1.3) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{stats.completedTasks}/{stats.totalTasks} tasks</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Time Efficiency */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getEfficiencyIcon(stats.efficiency)}
              <span className="text-sm font-medium">Efficiency</span>
            </div>
            <div className="space-y-1">
              <p className={`text-lg font-bold ${getEfficiencyColor(stats.efficiency)}`}>
                {Math.round(stats.efficiency * 100)}%
              </p>
              <p className="text-xs text-gray-500">
                {stats.efficiency > 1 ? 'Over estimate' : 'Under estimate'}
              </p>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">{stats.totalEstimatedHours}h</p>
              <p className="text-xs text-gray-500">
                {stats.totalActualHours}h logged
              </p>
            </div>
          </div>

          {/* Critical Items */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {stats.criticalTasks.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stats.criticalTasks.length} critical
                  </Badge>
                )}
                {stats.blockedTasks.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {stats.blockedTasks.length} blocked
                  </Badge>
                )}
                {stats.criticalTasks.length === 0 && stats.blockedTasks.length === 0 && (
                  <Badge variant="outline" className="text-xs">
                    All clear
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Alerts */}
        {(stats.upcomingDeadlines.length > 0 || stats.criticalTasks.length > 0) && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {stats.upcomingDeadlines.slice(0, 2).map((deadline, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-orange-600">
                  <Calendar className="h-3 w-3" />
                  <span>{deadline.phaseName} in {deadline.daysRemaining}d</span>
                </div>
              ))}
              {stats.criticalTasks.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{stats.criticalTasks.length} critical tasks</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
