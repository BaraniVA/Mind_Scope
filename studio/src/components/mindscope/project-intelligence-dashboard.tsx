// src/components/mindscope/project-intelligence-dashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Brain,
  Lightbulb,
  Zap,
  BarChart3,
  Calendar,
  Users,
  Code,
  Database,
  Server,
  Smartphone
} from 'lucide-react';
import type { Project } from '@/lib/types';
import { 
  calculateProjectProgress, 
  calculateWeightedProgress,
  getProjectStats,
  predictCompletionDate,
  identifyBottlenecks,
  generateProgressInsights
} from '@/lib/services/progress-tracker';

interface ProjectIntelligenceDashboardProps {
  project: Project;
  onOptimizeProject?: (forceRefresh?: boolean) => void;
  optimizationResults?: {
    optimizations: string[];
    timelinePrediction: string;
    scopeAdjustments: string[];
    riskAlerts: string[];
    generatedAt?: number;
  } | null;
}

export function ProjectIntelligenceDashboard({ 
  project, 
  onOptimizeProject,
  optimizationResults 
}: ProjectIntelligenceDashboardProps) {
  const [stats, setStats] = useState(getProjectStats(project));
  const [prediction, setPrediction] = useState(predictCompletionDate(project));
  const [bottlenecks, setBottlenecks] = useState(identifyBottlenecks(project));
  const [insights, setInsights] = useState(generateProgressInsights(project));

  useEffect(() => {
    setStats(getProjectStats(project));
    setPrediction(predictCompletionDate(project));
    setBottlenecks(identifyBottlenecks(project));
    setInsights(generateProgressInsights(project));
  }, [project]);

  const progressPercentage = calculateProjectProgress(project);
  const weightedProgress = calculateWeightedProgress(project);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTechStackIcon = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react') || techLower.includes('vue') || techLower.includes('angular')) {
      return <Code className="h-4 w-4" />;
    }
    if (techLower.includes('node') || techLower.includes('express') || techLower.includes('python')) {
      return <Server className="h-4 w-4" />;
    }
    if (techLower.includes('sql') || techLower.includes('mongo') || techLower.includes('redis')) {
      return <Database className="h-4 w-4" />;
    }
    if (techLower.includes('mobile') || techLower.includes('react native') || techLower.includes('flutter')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Code className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Project Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Project Intelligence
          </h2>
          <p className="text-gray-600">AI-powered insights and optimization recommendations</p>
        </div>
        {onOptimizeProject && (
          <div className="flex gap-2">
            <Button onClick={() => onOptimizeProject(false)} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Optimize
            </Button>
            {optimizationResults && (
              <Button 
                onClick={() => onOptimizeProject(true)} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Force Refresh
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-lg font-semibold">{formatDate(prediction.estimatedCompletionDate)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Badge variant={prediction.confidence === 'high' ? 'default' : 'secondary'} className="mt-2">
              {prediction.confidence} confidence
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks</p>
                <p className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{Math.round(stats.efficiency * 100)}%</p>
                  {stats.efficiency > 1 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-full ${stats.efficiency > 1 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Clock className={`h-6 w-6 ${stats.efficiency > 1 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Critical Information */}
      {(insights.alerts.length > 0 || stats.criticalTasks.length > 0 || stats.blockedTasks.length > 0) && (
        <div className="space-y-3">
          {insights.alerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
          
          {stats.criticalTasks.length > 0 && (
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                {stats.criticalTasks.length} critical tasks need immediate attention
              </AlertDescription>
            </Alert>
          )}
          
          {stats.blockedTasks.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stats.blockedTasks.length} tasks are blocked by dependencies
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="progress">Progress Analysis</TabsTrigger>
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.insights.length > 0 ? (
                  insights.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No specific insights available yet. Complete more tasks to get AI insights.</p>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.recommendations.length > 0 ? (
                  insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No specific recommendations yet. Project is on track!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Next Actions */}
          {insights.nextActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Next Actions
                </CardTitle>
                <CardDescription>Immediate steps to improve project progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {insights.nextActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      <p className="text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Progress Details */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Task Completion</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weighted Progress</span>
                    <span>{weightedProgress}%</span>
                  </div>
                  <Progress value={weightedProgress} />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Hours</p>
                    <p className="font-semibold">{stats.totalEstimatedHours}h estimated</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Actual Hours</p>
                    <p className="font-semibold">{stats.totalActualHours}h logged</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline Prediction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatDate(prediction.estimatedCompletionDate)}
                  </p>
                  <p className="text-sm text-gray-600">Estimated completion</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Remaining</p>
                    <p className="font-semibold">{Math.round(prediction.remainingHours)}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Daily Target</p>
                    <p className="font-semibold">{Math.round(prediction.recommendedDaily)}h/day</p>
                  </div>
                </div>

                <Badge variant={prediction.confidence === 'high' ? 'default' : 'secondary'} className="w-full justify-center">
                  {prediction.confidence} confidence prediction
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Phase Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Phase Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.phases.map((phase) => {
                  const phaseProgress = Math.round((phase.microtasks.filter(t => t.isCompleted).length / phase.microtasks.length) * 100);
                  return (
                    <div key={phase.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{phase.name}</h4>
                          {phase.milestone && <Badge variant="outline">Milestone</Badge>}
                        </div>
                        <span className="text-sm text-gray-600">{phaseProgress}%</span>
                      </div>
                      <Progress value={phaseProgress} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech-stack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
              <CardDescription>Current project technologies and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.metadata?.techStack ? (
                Object.entries(project.metadata.techStack).map(([category, technologies]) => (
                  technologies.length > 0 && (
                    <div key={category}>
                      <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech: string) => (
                          <Badge key={tech} variant="outline" className="flex items-center gap-1">
                            {getTechStackIcon(tech)}
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tech stack defined yet.</p>
                  <p className="text-sm mt-2">Use the AI Setup to get technology recommendations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {/* AI Optimization Results */}
          {optimizationResults && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      AI analysis completed! Found {optimizationResults.optimizations.length} optimization opportunities.
                    </span>
                    {optimizationResults.generatedAt && (
                      <Badge variant="outline" className="text-xs">
                        Generated {new Date(optimizationResults.generatedAt).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Optimization Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {optimizationResults.optimizations.map((optimization, index) => (
                      <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                        <p className="text-sm">{optimization}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Timeline Prediction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      Timeline Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <p className="text-sm">{optimizationResults.timelinePrediction}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Scope Adjustments */}
                {optimizationResults.scopeAdjustments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Scope Adjustments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {optimizationResults.scopeAdjustments.map((adjustment, index) => (
                        <div key={index} className="p-3 border-l-4 border-purple-500 bg-purple-50">
                          <p className="text-sm">{adjustment}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Risk Alerts */}
                {optimizationResults.riskAlerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Risk Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {optimizationResults.riskAlerts.map((alert, index) => (
                        <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50">
                          <p className="text-sm">{alert}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bottlenecks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Show AI-identified bottlenecks from optimization if available */}
                {optimizationResults && optimizationResults.riskAlerts.length > 0 ? (
                  optimizationResults.riskAlerts.map((alert, index) => (
                    <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50">
                      <h5 className="font-medium">AI-Identified Risk</h5>
                      <p className="text-sm text-gray-600 mt-1">{alert}</p>
                      <div className="mt-2">
                        <Badge variant="destructive" className="text-xs">
                          Requires attention
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : bottlenecks.bottlenecks.length > 0 ? (
                  bottlenecks.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="p-3 border-l-4 border-red-500 bg-red-50">
                      <h5 className="font-medium capitalize">{bottleneck.type} Issue</h5>
                      <p className="text-sm text-gray-600 mt-1">{bottleneck.description}</p>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">Suggestions:</p>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          {bottleneck.suggestions.map((suggestion, i) => (
                            <li key={i}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No bottlenecks identified. Project is flowing smoothly!</p>
                    {!optimizationResults && (
                      <p className="text-xs text-gray-400 mt-2">
                        Click "AI Optimize" above to get AI-powered bottleneck analysis
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Wins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Show AI-generated optimizations as quick wins */}
                {optimizationResults && optimizationResults.optimizations.length > 0 ? (
                  optimizationResults.optimizations.slice(0, 4).map((optimization, index) => {
                    // Extract impact and effort from the optimization string
                    const hasHighImpact = optimization.toLowerCase().includes('high impact');
                    const hasMediumImpact = optimization.toLowerCase().includes('medium impact');
                    const hasLowEffort = optimization.toLowerCase().includes('low effort');
                    const hasMediumEffort = optimization.toLowerCase().includes('medium effort');
                    const hasCritical = optimization.includes('🚨 Critical');
                    const hasHighPriority = optimization.includes('⚡ High Priority');
                    
                    return (
                      <div key={index} className={`p-3 border-l-4 ${
                        hasCritical ? 'border-red-500 bg-red-50' :
                        hasHighPriority ? 'border-orange-500 bg-orange-50' :
                        (hasHighImpact || hasMediumImpact) && hasLowEffort ? 'border-green-500 bg-green-50' : 
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <h5 className="font-medium">
                          {hasCritical ? '🚨 Critical Optimization' :
                           hasHighPriority ? '⚡ High Priority Win' :
                           (hasHighImpact || hasMediumImpact) && hasLowEffort ? '💡 Quick Win' :
                           '📋 Optimization Opportunity'}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {optimization.replace(/^(🚨 Critical: |⚡ High Priority: |📋 Medium Priority: |💡 )/, '')}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={hasHighImpact ? "default" : hasMediumImpact ? "secondary" : "outline"} className="text-xs">
                            {hasHighImpact ? 'High' : hasMediumImpact ? 'Medium' : 'Low'} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {hasLowEffort ? 'Low' : hasMediumEffort ? 'Medium' : 'High'} effort
                          </Badge>
                          {(hasCritical || hasHighPriority) && (
                            <Badge variant="destructive" className="text-xs">
                              Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : bottlenecks.quickWins.length > 0 ? (
                  bottlenecks.quickWins.map((quickWin, index) => (
                    <div key={index} className="p-3 border-l-4 border-green-500 bg-green-50">
                      <h5 className="font-medium">{quickWin.taskName}</h5>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {quickWin.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {quickWin.effort} effort
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No quick wins available. Focus on completing current tasks.</p>
                    {!optimizationResults && (
                      <p className="text-xs text-gray-400 mt-2">
                        Click "AI Optimize" above to discover optimization opportunities
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
