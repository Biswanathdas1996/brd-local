import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, Info, Clock, User, Edit3, Sparkles, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrdDisplayProps {
  brd: any;
  onRequirementUpdate?: (requirementId: string, updatedRequirement: any) => void;
}

export default function BrdDisplay({ brd, onRequirementUpdate }: BrdDisplayProps) {
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<any>({});
  const [loadingEnhancement, setLoadingEnhancement] = useState<string | null>(null);
  const { toast } = useToast();
  if (!brd?.content) {
    return (
      <div className="text-center py-8 text-slate-500">
        No BRD content available.
      </div>
    );
  }

  const { content } = brd;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleEditRequirement = (req: any) => {
    setEditingRequirement(req.id);
    setEditForm({ ...req });
  };

  const handleSaveRequirement = async () => {
    try {
      if (onRequirementUpdate && editingRequirement) {
        await onRequirementUpdate(editingRequirement, editForm);
        setEditingRequirement(null);
        setEditForm({});
        toast({
          title: "Success",
          description: "Requirement updated successfully",
        });
      }
    } catch (error: any) {
      console.error('Save requirement error:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to update requirement",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRequirement(null);
    setEditForm({});
  };

  const handleEnhanceRequirement = async (req: any) => {
    setLoadingEnhancement(req.id);
    try {
      const response = await fetch('/api/enhance-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement: req,
          context: {
            processArea: brd.processArea,
            targetSystem: brd.targetSystem
          }
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get enhancement suggestions');
      
      const suggestions = await response.json();
      setEnhancementSuggestions(prev => ({
        ...prev,
        [req.id]: suggestions
      }));
      
      toast({
        title: "Enhancement Suggestions Ready",
        description: "AI has generated improvement suggestions for this requirement",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate enhancement suggestions",
        variant: "destructive",
      });
    } finally {
      setLoadingEnhancement(null);
    }
  };

  const applyEnhancement = (reqId: string, enhancedReq: any) => {
    setEditForm(enhancedReq);
    setEditingRequirement(reqId);
    setEnhancementSuggestions(prev => {
      const updated = { ...prev };
      delete updated[reqId];
      return updated;
    });
  };

  return (
    <div className="prose max-w-none space-y-6">
      {/* Table of Contents */}
      {content.tableOfContents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {content.tableOfContents.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-700">{item.section}</span>
                  <span className="text-gray-500">Page {item.pageNumber}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Executive Summary</h3>
        <p className="text-slate-700 leading-relaxed">{content.executiveSummary}</p>
      </div>

      <Separator />

      {/* Functional Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Functional Requirements</h3>
        <div className="space-y-4">
          {content.functionalRequirements?.map((req: any, index: number) => (
            <Card key={index} className="border border-slate-200">
              <CardContent className="p-4">
                {editingRequirement === req.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={editForm.id || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, id: e.target.value }))}
                        className="w-32"
                        placeholder="ID"
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveRequirement}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Title"
                    />
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      rows={3}
                    />
                    <div className="flex space-x-4">
                      <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={editForm.complexity} onValueChange={(value) => setEditForm(prev => ({ ...prev, complexity: value }))}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Complexity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{req.id}: {req.title}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                          <Badge className={getComplexityColor(req.complexity)}>{req.complexity}</Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditRequirement(req)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEnhanceRequirement(req)}
                            disabled={loadingEnhancement === req.id}
                          >
                            <Sparkles className="w-4 h-4" />
                            {loadingEnhancement === req.id ? '...' : ''}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{req.description}</p>
                    
                    {/* Acceptance Criteria */}
                    {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-slate-800 mb-2">Acceptance Criteria:</h5>
                        <ul className="space-y-1">
                          {req.acceptanceCriteria.map((criteria: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* User Stories */}
                    {req.userStories && req.userStories.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-slate-800 mb-2">User Stories:</h5>
                        <div className="space-y-2">
                          {req.userStories.map((story: any, idx: number) => (
                            <div key={idx} className="text-sm text-slate-600 bg-blue-50 p-2 rounded">
                              <strong>As a</strong> {story.role}, <strong>I want</strong> {story.goal} <strong>so that</strong> {story.benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dependencies */}
                    {req.dependencies && req.dependencies.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-slate-800 mb-2">Dependencies:</h5>
                        <div className="flex flex-wrap gap-2">
                          {req.dependencies.map((dep: string, idx: number) => (
                            <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Enhancement Suggestions */}
                    {enhancementSuggestions[req.id] && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">AI Enhancement Suggestions:</h5>
                        <div className="space-y-2">
                          {enhancementSuggestions[req.id].suggestions?.map((suggestion: string, idx: number) => (
                            <p key={idx} className="text-sm text-blue-800">• {suggestion}</p>
                          ))}
                          {enhancementSuggestions[req.id].enhancedRequirement && (
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                onClick={() => applyEnhancement(req.id, enhancementSuggestions[req.id].enhancedRequirement)}
                              >
                                Apply Enhanced Version
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Non-Functional Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Non-Functional Requirements</h3>
        <div className="space-y-4">
          {content.nonFunctionalRequirements?.map((req: any, index: number) => (
            <Card key={index} className="border border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{req.id}: {req.title}</h4>
                  {req.category && (
                    <Badge variant="outline" className="ml-2">
                      {req.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-700 mb-3">{req.description}</p>
                
                {/* Enhanced NFR Details */}
                <div className="space-y-3">
                  {req.scalabilityMetrics && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">Scalability Metrics:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Concurrent Users:</strong> {req.scalabilityMetrics.concurrentUsers}</div>
                        <div><strong>Transaction Volume:</strong> {req.scalabilityMetrics.transactionVolume}</div>
                      </div>
                    </div>
                  )}
                  
                  {req.availabilityRequirements && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Availability Requirements:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Uptime:</strong> {req.availabilityRequirements.uptime}</div>
                        <div><strong>Disaster Recovery:</strong> {req.availabilityRequirements.disasterRecovery}</div>
                      </div>
                    </div>
                  )}
                  
                  {req.securityStandards && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Security Standards:</h5>
                      <div className="space-y-1 text-sm">
                        <div><strong>Encryption:</strong> {req.securityStandards.encryption}</div>
                        <div><strong>Audit Trails:</strong> {req.securityStandards.auditTrails}</div>
                        <div><strong>Access Controls:</strong> {req.securityStandards.accessControls}</div>
                      </div>
                    </div>
                  )}
                  
                  {req.usabilityStandards && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h5 className="font-medium text-purple-800 mb-2">Usability Standards:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Response Time:</strong> {req.usabilityStandards.responseTime}</div>
                        <div><strong>User Experience:</strong> {req.usabilityStandards.userExperience}</div>
                      </div>
                    </div>
                  )}
                  
                  {req.complianceDetails && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">Compliance Details:</h5>
                      <div className="text-sm">
                        <div className="mb-2">
                          <strong>Regulations:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {req.complianceDetails.regulations?.map((reg: string, idx: number) => (
                              <span key={idx} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                                {reg}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div><strong>Requirements:</strong> {req.complianceDetails.requirements}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Integration Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Integration Requirements</h3>
        <div className="space-y-4">
          {content.integrationRequirements?.map((req: any, index: number) => (
            <Card key={index} className="border border-slate-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-900 mb-2">{req.id}: {req.title}</h4>
                <p className="text-sm text-slate-700 mb-3">{req.description}</p>
                
                {/* API Specifications */}
                {req.apiSpecifications && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <h5 className="font-medium text-gray-800 mb-2">API Specifications:</h5>
                    <div className="space-y-1 text-sm">
                      <div><strong>Endpoints:</strong> {req.apiSpecifications.endpoints}</div>
                      <div><strong>Data Formats:</strong> {req.apiSpecifications.dataFormats}</div>
                      <div><strong>Authentication:</strong> {req.apiSpecifications.authentication}</div>
                    </div>
                  </div>
                )}
                
                {/* Data Flow */}
                {req.dataFlow && req.dataFlow.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Data Flow:</h5>
                    <ol className="space-y-1">
                      {req.dataFlow.map((step: string, idx: number) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-start">
                          <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Business Process Flows */}
      {content.businessProcessFlows && content.businessProcessFlows.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Process Flows</h3>
          <div className="space-y-4">
            {content.businessProcessFlows.map((process: any, index: number) => (
              <Card key={index} className="border border-slate-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 mb-2">{process.id}: {process.processName}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Current State:</h5>
                      <p className="text-sm text-red-700">{process.currentState}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Future State:</h5>
                      <p className="text-sm text-green-700">{process.futureState}</p>
                    </div>
                  </div>
                  
                  {process.steps && process.steps.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Process Steps:</h5>
                      <div className="space-y-2">
                        {process.steps.map((step: any, idx: number) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <span className="bg-pwc-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {step.stepNumber}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm">
                                <strong>{step.actor}:</strong> {step.description}
                              </div>
                              {step.decision && (
                                <div className="text-xs text-orange-600 mt-1">
                                  <strong>Decision:</strong> {step.decision}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {content.businessProcessFlows && content.businessProcessFlows.length > 0 && <Separator />}

      {/* User Interface Requirements */}
      {content.userInterfaceRequirements && content.userInterfaceRequirements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Interface Requirements</h3>
          <div className="space-y-4">
            {content.userInterfaceRequirements.map((ui: any, index: number) => (
              <Card key={index} className="border border-slate-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 mb-2">{ui.id}: {ui.screenName}</h4>
                  <p className="text-sm text-slate-700 mb-3">{ui.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {ui.components && ui.components.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h5 className="font-medium text-purple-800 mb-2">Components:</h5>
                          <div className="flex flex-wrap gap-1">
                            {ui.components.map((component: string, idx: number) => (
                              <span key={idx} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs">
                                {component}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {ui.navigationFlow && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Navigation Flow:</h5>
                          <p className="text-sm text-blue-700">{ui.navigationFlow}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {ui.accessibility && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">Accessibility:</h5>
                          <p className="text-sm text-green-700">{ui.accessibility}</p>
                        </div>
                      )}
                      
                      {ui.responsiveness && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h5 className="font-medium text-orange-800 mb-2">Responsiveness:</h5>
                          <p className="text-sm text-orange-700">{ui.responsiveness}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {content.userInterfaceRequirements && content.userInterfaceRequirements.length > 0 && <Separator />}

      {/* Risk Management */}
      {content.riskManagement && content.riskManagement.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Management</h3>
            <div className="space-y-4">
              {content.riskManagement.map((risk: any, index: number) => (
                <Card key={index} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{risk.id}: {risk.description}</h4>
                      <Badge variant="outline" className="ml-2">
                        {risk.category}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-xs font-medium text-yellow-800">Probability</div>
                        <div className="text-sm text-yellow-700">{risk.probability}</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-xs font-medium text-red-800">Impact</div>
                        <div className="text-sm text-red-700">{risk.impact}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs font-medium text-green-800">Mitigation</div>
                        <div className="text-sm text-green-700">{risk.mitigation}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-xs font-medium text-blue-800">Owner</div>
                        <div className="text-sm text-blue-700">{risk.owner}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Additional Sections */}
      {(content.assumptions || content.constraints) && (
        <>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assumptions */}
            {content.assumptions && content.assumptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assumptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.assumptions.map((assumption: string, index: number) => (
                      <li key={index} className="text-sm text-slate-700 flex items-start">
                        <span className="text-pwc-blue mr-2">•</span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Constraints */}
            {content.constraints && content.constraints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.constraints.map((constraint: string, index: number) => (
                      <li key={index} className="text-sm text-slate-700 flex items-start">
                        <span className="text-pwc-orange mr-2">•</span>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
