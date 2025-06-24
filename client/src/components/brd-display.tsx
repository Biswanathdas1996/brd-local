import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle, Info, Clock, User } from "lucide-react";

interface BrdDisplayProps {
  brd: any;
}

export default function BrdDisplay({ brd }: BrdDisplayProps) {
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
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{req.id}: {req.title}</h4>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                    <Badge className={getComplexityColor(req.complexity)}>{req.complexity}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700">{req.description}</p>
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
