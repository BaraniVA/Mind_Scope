
"use client";

import React from 'react';
import type { Project, Phase, Microtask } from '@/lib/types';
import { PhaseItem } from './phase-item';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TaskListProps {
  project: Project;
  onAddPhase: (phaseName: string) => void;
  onUpdatePhase: (updatedPhase: Phase) => void;
  onDeletePhase: (phaseId: string) => void;
  onAddMicrotask: (phaseId: string, microtaskName: string) => void;
  onUpdateMicrotask: (phaseId: string, updatedMicrotask: Microtask) => void;
  onDeleteMicrotask: (phaseId: string, microtaskId: string) => void;
}

export function TaskList({
  project,
  onAddPhase,
  onUpdatePhase,
  onDeletePhase,
  onAddMicrotask,
  onUpdateMicrotask,
  onDeleteMicrotask,
}: TaskListProps) {
  
  const handleAddNewPhase = () => {
    const phaseName = prompt("Enter new phase name:");
    if (phaseName && phaseName.trim()) {
      onAddPhase(phaseName.trim());
    }
  };

  if (!project || project.phases.length === 0) {
    return (
      <Card className="mt-6 text-center shadow-lg">
        <CardHeader>
            <CardTitle>No Phases Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Add phases to your project or use AI suggestions.</p>
          <Button onClick={handleAddNewPhase} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Phase
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Project Phases</h2>
        <Button onClick={handleAddNewPhase} variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Phase
        </Button>
      </div>
      <Accordion type="multiple" className="w-full space-y-1" defaultValue={project.phases.map(p => p.id)}>
        {project.phases.map(phase => (
          <PhaseItem
            key={phase.id}
            phase={phase}
            onUpdatePhase={onUpdatePhase}
            onDeletePhase={onDeletePhase}
            onAddMicrotask={onAddMicrotask}
            onUpdateMicrotask={onUpdateMicrotask}
            onDeleteMicrotask={onDeleteMicrotask}
          />
        ))}
      </Accordion>
    </div>
  );
}
