"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Microtask } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit3, Save, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface MicrotaskItemProps {
  microtask: Microtask;
  onUpdateMicrotask: (updatedMicrotask: Microtask) => void;
  onDeleteMicrotask: (microtaskId: string) => void;
}

export function MicrotaskItem({ microtask, onUpdateMicrotask, onDeleteMicrotask }: MicrotaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(microtask.name);
  const [editableTime, setEditableTime] = useState(
    microtask.estimatedTime?.toString() || '0'
  );

  useEffect(() => {
    if (!isEditing) {
      setEditableName(microtask.name);
      setEditableTime(microtask.estimatedTime?.toString() || '0');
    }
  }, [microtask, isEditing]);

  const handleSave = () => {
    const newEstimatedTime = parseFloat(editableTime) || 0;
    onUpdateMicrotask({
      ...microtask,
      name: editableName,
      estimatedTime: newEstimatedTime,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditableName(microtask.name);
    setEditableTime(microtask.estimatedTime?.toString() || '0');
    setIsEditing(false);
  };

  const handleToggleComplete = (checked: boolean | string) => {
    const isCompleted = checked === true;
    
    console.log('MicrotaskItem: Toggle complete', {
      id: microtask.id,
      from: microtask.isCompleted,
      to: isCompleted
    });
    
    // Create updated microtask object
    const updatedMicrotask = {
      ...microtask,
      isCompleted,
      completedAt: isCompleted ? Date.now() : undefined,
      // Set actualTime to estimatedTime if not already set when completing task
      actualTime: isCompleted 
        ? (microtask.actualTime || microtask.estimatedTime) 
        : microtask.actualTime
    };
    
    // Remove completedAt and actualTime if task is being marked as incomplete
    if (!isCompleted) {
      if (updatedMicrotask.completedAt !== undefined) {
        delete updatedMicrotask.completedAt;
      }
      // Only remove actualTime if it was set to estimatedTime (no manual tracking)
      if (microtask.actualTime === undefined || microtask.actualTime === microtask.estimatedTime) {
        delete updatedMicrotask.actualTime;
      }
    }
    
    // Immediately call the update function without any delays
    onUpdateMicrotask(updatedMicrotask);
  };

  return (
    <Card className={`mb-2 transition-all duration-200 ${microtask.isCompleted ? 'bg-muted/50 opacity-70' : 'bg-card'}`}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`task-${microtask.id}`}
            checked={microtask.isCompleted}
            onCheckedChange={handleToggleComplete}
            aria-label={`Mark task ${microtask.name} as ${microtask.isCompleted ? 'incomplete' : 'complete'}`}
            className="transform scale-110"
          />
          {isEditing ? (
            <Input
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              className="flex-grow h-8 text-sm"
              aria-label="Edit task name"
            />
          ) : (
            <label
              htmlFor={`task-${microtask.id}`}
              className={`flex-grow cursor-pointer text-sm ${microtask.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
            >
              {microtask.name}
            </label>
          )}
        </div>

        {isEditing ? (
          <div className="mt-3 space-y-3">
            <div>
              <Label htmlFor={`time-${microtask.id}`} className="text-xs text-muted-foreground mb-1 block">Estimated Time (hours)</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id={`time-${microtask.id}`}
                  type="number"
                  value={editableTime}
                  onChange={(e) => setEditableTime(e.target.value)}
                  placeholder="Hours"
                  className="w-24 h-8 text-sm"
                  aria-label="Edit estimated time"
                  min="0"
                  step="0.25"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button onClick={handleSave} size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-100">
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button onClick={handleCancelEdit} size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                <XCircle className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{microtask.estimatedTime} hr(s)</span>
              </div>
              {microtask.isCompleted && microtask.completedAt && (
                <div className="flex items-center space-x-1 text-green-600">
                  <span>✓</span>
                  <span>Completed {new Date(microtask.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button onClick={() => setIsEditing(true)} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary">
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Edit Task</span>
              </Button>
              <Button onClick={() => onDeleteMicrotask(microtask.id)} size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Task</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}