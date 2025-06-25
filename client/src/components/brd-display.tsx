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
                    <p className="text-sm text-slate-700">{req.description}</p>
                    
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
                <h4 className="font-medium text-slate-900 mb-2">{req.id}: {req.title}</h4>
                <p className="text-sm text-slate-700">{req.description}</p>
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
                <p className="text-sm text-slate-700">{req.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Sections */}
      {(content.assumptions || content.constraints || content.riskMitigation) && (
        <>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Risk Mitigation */}
            {content.riskMitigation && content.riskMitigation.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Mitigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.riskMitigation.map((risk: string, index: number) => (
                      <li key={index} className="text-sm text-slate-700 flex items-start">
                        <span className="text-pwc-red mr-2">•</span>
                        {risk}
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
