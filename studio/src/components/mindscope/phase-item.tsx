// src/components/mindscope/phase-item.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { Phase, Microtask } from '@/lib/types';
import { MicrotaskItem } from './microtask-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AccordionContent, AccordionItem, AccordionHeader, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, Edit3, Save, XCircle, Folder } from 'lucide-react';


interface PhaseItemProps {
  phase: Phase;
  onUpdatePhase: (updatedPhase: Phase) => void;
  onDeletePhase: (phaseId: string) => void;
  onAddMicrotask: (phaseId: string, microtaskName: string) => void;
  onUpdateMicrotask: (phaseId: string, updatedMicrotask: Microtask) => void;
  onDeleteMicrotask: (phaseId: string, microtaskId: string) => void;
}

export function PhaseItem({
  phase,
  onUpdatePhase,
  onDeletePhase,
  onAddMicrotask,
  onUpdateMicrotask,
  onDeleteMicrotask,
}: PhaseItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editablePhaseName, setEditablePhaseName] = useState(phase.name);
  const [newMicrotaskName, setNewMicrotaskName] = useState('');

  useEffect(() => {
    setEditablePhaseName(phase.name);
  }, [phase.name]);

  const handleSavePhaseName = () => {
    if (editablePhaseName.trim() === '') {
        // Optionally, add a toast notification for empty phase name
        setEditablePhaseName(phase.name); // Revert to original name
        setIsEditingName(false);
        return;
    }
    onUpdatePhase({ ...phase, name: editablePhaseName.trim() });
    setIsEditingName(false);
  };
  
  const handleCancelEditPhaseName = () => {
    setEditablePhaseName(phase.name);
    setIsEditingName(false);
  };

  const handleAddMicrotask = () => {
    if (newMicrotaskName.trim()) {
      onAddMicrotask(phase.id, newMicrotaskName.trim());
      setNewMicrotaskName('');
    }
  };

  const phaseProgress = (() => {
    if (phase.microtasks.length === 0) return 0;
    const completedCount = phase.microtasks.filter(mt => mt.isCompleted).length;
    return (completedCount / phase.microtasks.length) * 100;
  })();

  return (
    <AccordionItem value={phase.id} className="mb-4 bg-card shadow-md rounded-lg overflow-hidden border border-border">
      <AccordionHeader className="flex flex-col px-4 py-3 group">
        <div className="flex items-center w-full">
           <AccordionTrigger className="flex-grow p-0 hover:no-underline">
            <div className="flex items-center min-w-0">
                <Folder className="h-5 w-5 mr-3 text-primary shrink-0" />
                {isEditingName ? (
                    <Input
                    value={editablePhaseName}
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => setEditablePhaseName(e.target.value)}
                    className="h-8 text-lg flex-grow mr-2 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none p-0" 
                    aria-label="Edit phase name"
                    onBlur={handleSavePhaseName} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent form submission if any
                            handleSavePhaseName();
                        } else if (e.key === 'Escape') {
                            handleCancelEditPhaseName();
                        }
                    }}
                    autoFocus
                    />
                ) : (
                    <span className="truncate text-lg font-semibold text-primary" title={phase.name}>{phase.name}</span>
                )}
            </div>
          </AccordionTrigger>

          <div className="flex items-center space-x-1 shrink-0 ml-2">
            {isEditingName ? (
              <>
                <Button onClick={(e) => { e.stopPropagation(); handleSavePhaseName(); }} size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100">
                  <Save className="h-4 w-4" /> <span className="sr-only">Save Name</span>
                </Button>
                <Button onClick={(e) => { e.stopPropagation(); handleCancelEditPhaseName(); }} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <XCircle className="h-4 w-4" /> <span className="sr-only">Cancel Edit Name</span>
                </Button>
              </>
            ) : (
              <Button onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary">
                <Edit3 className="h-4 w-4" /> <span className="sr-only">Edit Name</span>
              </Button>
            )}
            <Button onClick={(e) => { e.stopPropagation(); onDeletePhase(phase.id); }} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete Phase</span>
            </Button>
          </div>
        </div>
        <Progress value={phaseProgress} className="w-full h-1.5 mt-2 mb-1 bg-muted" indicatorClassName="bg-primary" />
      </AccordionHeader>
      
      <AccordionContent className="px-4 py-3 border-t border-border bg-background/30">
        <div className="space-y-3">
          {phase.microtasks.map(microtask => (
            <MicrotaskItem
              key={microtask.id}
              microtask={microtask}
              onUpdateMicrotask={(updatedMt) => onUpdateMicrotask(phase.id, updatedMt)}
              onDeleteMicrotask={(microtaskId) => onDeleteMicrotask(phase.id, microtaskId)}
            />
          ))}
          {phase.microtasks.length === 0 && <p className="text-sm text-muted-foreground">No microtasks yet. Add one below!</p>}
        </div>
        <div className="mt-4 flex space-x-2">
          <Input
            value={newMicrotaskName}
            onChange={(e) => setNewMicrotaskName(e.target.value)}
            placeholder="New microtask name"
            className="flex-grow h-9"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMicrotask()}
          />
          <Button onClick={handleAddMicrotask} size="sm" variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Microtask
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
