"use client";

import React from 'react';
import type { Project } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ListChecks } from 'lucide-react';

interface OverallProgressProps {
  project: Project;
}

export function OverallProgress({ project }: OverallProgressProps) {
  const { totalMicrotasks, completedMicrotasks } = project.phases.reduce(
    (acc, phase) => {
      acc.totalMicrotasks += phase.microtasks.length;
      acc.completedMicrotasks += phase.microtasks.filter(mt => mt.isCompleted).length;
      return acc;
    },
    { totalMicrotasks: 0, completedMicrotasks: 0 }
  );

  const overallProgressPercentage = totalMicrotasks > 0 ? (completedMicrotasks / totalMicrotasks) * 100 : 0;

  return (
    <Card className="w-full shadow-lg my-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Overall Project Progress
        </CardTitle>
        <CardDescription>
          A snapshot of your project's completion status across all phases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalMicrotasks === 0 ? (
          <p className="text-muted-foreground">No microtasks defined yet. Add tasks to see progress.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                {completedMicrotasks} / {totalMicrotasks} microtasks completed
              </span>
              <span className="text-lg font-semibold text-primary">
                {overallProgressPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={overallProgressPercentage} className="w-full h-3 bg-muted" indicatorClassName="bg-primary" />
            {overallProgressPercentage === 100 && completedMicrotasks > 0 && (
              <div className="mt-3 flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <p className="font-medium">Congratulations! All tasks are completed.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
