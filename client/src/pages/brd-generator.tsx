import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  User,
  Upload,
  Wand2,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FileUpload from "@/components/file-upload";
import BrdDisplay from "@/components/brd-display";
import AddTeamDialog from "@/components/add-team-dialog";

const brdFormSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  teamId: z.string().min(1, "Please select a team"),
  transcriptId: z.string().min(1, "Please upload a transcript"),
  processArea: z.enum([
    "account_opening",
    "loan_processing",
    "customer_onboarding",
    "kyc_aml_compliance",
    "digital_banking",
    "payment_processing",
    "credit_assessment",
    "priority_banking",
    "trade_finance",
    "treasury_management",
    "regulatory_reporting",
    "risk_management",
  ]),
  targetSystem: z.enum([
    "finacle",
    "temenos_t24",
    "infosys_banking_platform",
    "oracle_flexcube",
    "tcs_bancs",
    "nucleus_software",
    "intellect_design_arena",
    "newgen_software",
    "mantra_omnichannel",
    "kony_banking",
    "mindtree_digital",
    "rbi_rtgs_neft",
    "npci_upi",
    "salesforce_financial_services",
    "microsoft_dynamics_365",
    "custom_application_development",
  ]),
  template: z
    .enum(["standard", "agile", "detailed", "executive"])
    .default("standard"),
  analysisDepth: z
    .enum(["basic", "detailed", "comprehensive"])
    .default("detailed"),
});

type BrdFormData = z.infer<typeof brdFormSchema>;

const processAreaLabels = {
  account_opening: "Account Opening & Management",
  loan_processing: "Loan Processing & Origination",
  customer_onboarding: "Customer Onboarding",
  kyc_aml_compliance: "KYC & AML Compliance",
  digital_banking: "Digital Banking & Mobile",
  payment_processing: "Payment & Settlement",
  credit_assessment: "Credit Assessment & Scoring",
  priority_banking: "Priority Banking Services",
  trade_finance: "Trade Finance & LC",
  treasury_management: "Treasury & Investment",
  regulatory_reporting: "Regulatory Reporting",
  risk_management: "Risk Management",
};

const targetSystemLabels = {
  finacle: "Infosys Finacle",
  temenos_t24: "Temenos T24",
  infosys_banking_platform: "Infosys Banking Platform",
  oracle_flexcube: "Oracle FLEXCUBE",
  tcs_bancs: "TCS BaNCS",
  nucleus_software: "Nucleus Software FinnOne",
  intellect_design_arena: "Intellect Design Arena",
  newgen_software: "NewGen Banking Suite",
  mantra_omnichannel: "Mantra Omnichannel Banking",
  kony_banking: "Kony Digital Banking",
  mindtree_digital: "Mindtree Digital Banking",
  rbi_rtgs_neft: "RBI RTGS/NEFT System",
  npci_upi: "NPCI UPI Platform",
  salesforce_financial_services: "Salesforce Financial Services Cloud",
  microsoft_dynamics_365: "Microsoft Dynamics 365",
  custom_application_development: "Custom Application Development",
};

export default function BrdGenerator() {
  const { toast } = useToast();
  const [uploadedTranscript, setUploadedTranscript] = useState<any>(null);
  const [currentBrd, setCurrentBrd] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const form = useForm<BrdFormData>({
    resolver: zodResolver(brdFormSchema),
    defaultValues: {
      template: "standard",
      analysisDepth: "detailed",
    },
  });

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Fetch teams for selected client
  const selectedClientId = form.watch("clientId");
  const { data: teams } = useQuery({
    queryKey: ["/api/teams", selectedClientId],
    queryFn: () =>
      fetch(`/api/teams/${selectedClientId}`).then((res) => res.json()),
    enabled: !!selectedClientId,
  });

  // Fetch BRD history
  const { data: brdHistory } = useQuery({
    queryKey: ["/api/brds"],
  });

  // Generate BRD mutation
  const generateBrdMutation = useMutation({
    mutationFn: async (data: BrdFormData) => {
      const response = await fetch("/api/generate-brd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clientId: parseInt(data.clientId),
          teamId: parseInt(data.teamId),
          transcriptId: parseInt(data.transcriptId),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsGenerating(true);
      pollBrdStatus(data.brdId);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Poll BRD status
  const pollBrdStatus = async (brdId: number) => {
    setGenerationProgress(20);

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/brd/${brdId}`);
        const brd = await response.json();

        if (brd.status === "completed") {
          setGenerationProgress(100);
          setCurrentBrd(brd);
          setIsGenerating(false);
          queryClient.invalidateQueries({ queryKey: ["/api/brds"] });
          toast({
            title: "BRD Generated Successfully",
            description:
              "Your Business Requirements Document is ready for review.",
          });
        } else if (brd.status === "failed") {
          setIsGenerating(false);
          setGenerationProgress(0);
          toast({
            title: "Generation Failed",
            description: "Failed to generate BRD. Please try again.",
            variant: "destructive",
          });
        } else {
          // Still generating, continue polling
          setGenerationProgress((prev) => Math.min(prev + 10, 90));
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        setIsGenerating(false);
        setGenerationProgress(0);
        toast({
          title: "Error",
          description: "Failed to check generation status.",
          variant: "destructive",
        });
      }
    };

    setTimeout(checkStatus, 1000);
  };

  const onSubmit = (data: BrdFormData) => {
    generateBrdMutation.mutate(data);
  };

  const handleTranscriptUploaded = (transcript: any, suggestions?: any) => {
    setUploadedTranscript(transcript);
    form.setValue("transcriptId", transcript.id.toString());

    if (suggestions?.suggestedProcessArea) {
      form.setValue("processArea", suggestions.suggestedProcessArea);
    }
    if (suggestions?.suggestedTargetSystem) {
      form.setValue("targetSystem", suggestions.suggestedTargetSystem);
    }
  };

  const handleViewTranscript = () => {
    if (uploadedTranscript) {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Transcript: ${uploadedTranscript.filename}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #0079F2; padding-bottom: 10px; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>${uploadedTranscript.filename}</h1>
              <div class="content">${uploadedTranscript.content}</div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  const handleDownload = () => {
    if (!currentBrd) return;

    // Generate Word document content
    const content = generateWordDocument(currentBrd);
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BRD_${currentBrd.id}_${new Date().toISOString().split("T")[0]}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateWordDocument = (brd: any) => {
    // Generate HTML content that can be saved as Word document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Requirements Document</title>
          <style>
            body { font-family: Calibri, Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #1f4e79; border-bottom: 3px solid #1f4e79; padding-bottom: 10px; }
            h2 { color: #2f5f8f; margin-top: 30px; margin-bottom: 15px; }
            h3 { color: #4f7fbf; margin-top: 20px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .priority-high { background-color: #ffebee; }
            .priority-medium { background-color: #fff3e0; }
            .priority-low { background-color: #e8f5e8; }
            .toc-item { margin: 5px 0; display: flex; justify-content: space-between; }
            .changelog-entry { border-left: 4px solid #4CAF50; padding-left: 15px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Business Requirements Document</h1>
          <p><strong>Generated on:</strong> ${new Date(brd.generatedAt).toLocaleString()}</p>
          <p><strong>Process Area:</strong> ${processAreaLabels[brd.processArea as keyof typeof processAreaLabels]}</p>
          <p><strong>Target System:</strong> ${targetSystemLabels[brd.targetSystem as keyof typeof targetSystemLabels]}</p>
          
          ${
            brd.content.tableOfContents
              ? `
          <h2>Table of Contents</h2>
          ${brd.content.tableOfContents
            .map(
              (item: any) =>
                `<div class="toc-item"><span>${item.section}</span><span>Page ${item.pageNumber}</span></div>`,
            )
            .join("")}
          `
              : ""
          }
          
          <h2>Executive Summary</h2>
          <p>${brd.content.executiveSummary}</p>
          
          <h2>Functional Requirements</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Complexity</th>
            </tr>
            ${
              brd.content.functionalRequirements
                ?.map(
                  (req: any) => `
              <tr class="priority-${req.priority.toLowerCase()}">
                <td>${req.id}</td>
                <td>${req.title}</td>
                <td>${req.description}</td>
                <td>${req.priority}</td>
                <td>${req.complexity}</td>
              </tr>
            `,
                )
                .join("") || ""
            }
          </table>
          
          <h2>Non-Functional Requirements</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
            ${
              brd.content.nonFunctionalRequirements
                ?.map(
                  (req: any) => `
              <tr>
                <td>${req.id}</td>
                <td>${req.title}</td>
                <td>${req.description}</td>
              </tr>
            `,
                )
                .join("") || ""
            }
          </table>
          
          <h2>Integration Requirements</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
            </tr>
            ${
              brd.content.integrationRequirements
                ?.map(
                  (req: any) => `
              <tr>
                <td>${req.id}</td>
                <td>${req.title}</td>
                <td>${req.description}</td>
              </tr>
            `,
                )
                .join("") || ""
            }
          </table>
          
          ${
            brd.content.raciMatrix
              ? `
          <h2>RACI Matrix</h2>
          <table>
            <tr>
              <th>Task</th>
              <th>Responsible</th>
              <th>Accountable</th>
              <th>Consulted</th>
              <th>Informed</th>
            </tr>
            ${brd.content.raciMatrix
              .map(
                (item: any) => `
              <tr>
                <td>${item.task}</td>
                <td>${item.responsible}</td>
                <td>${item.accountable}</td>
                <td>${item.consulted}</td>
                <td>${item.informed}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
          `
              : ""
          }
          
          <h2>Assumptions</h2>
          <ul>
            ${brd.content.assumptions?.map((assumption: string) => `<li>${assumption}</li>`).join("") || ""}
          </ul>
          
          <h2>Constraints</h2>
          <ul>
            ${brd.content.constraints?.map((constraint: string) => `<li>${constraint}</li>`).join("") || ""}
          </ul>
          
          <h2>Risk Mitigation</h2>
          <ul>
            ${brd.content.riskMitigation?.map((risk: string) => `<li>${risk}</li>`).join("") || ""}
          </ul>
          
          ${
            brd.content.changelog
              ? `
          <h2>Changelog</h2>
          ${brd.content.changelog
            .map(
              (entry: any) => `
            <div class="changelog-entry">
              <strong>Version ${entry.version}</strong> - ${entry.date} - ${entry.author}<br>
              ${entry.changes}
            </div>
          `,
            )
            .join("")}
          `
              : ""
          }
        </body>
      </html>
    `;

    return htmlContent;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pwc-blue rounded-lg flex items-center justify-center">
                  <FileText className="text-white text-sm" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    BRD Generator
                  </h1>
                  <p className="text-xs text-slate-500">
                    Indian Banking Systems Advisory
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  Priya Sharma
                </p>
                <p className="text-xs text-slate-500">Banking Consultant</p>
              </div>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="text-slate-600 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Client & Team Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Client & Team Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("teamId", ""); // Reset team when client changes
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client: any) => (
                              <SelectItem
                                key={client.id}
                                value={client.id.toString()}
                              >
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Team
                          {selectedClientId && (
                            <AddTeamDialog
                              clientId={selectedClientId}
                              onTeamAdded={(team) => {
                                // Auto-select the newly created team
                                form.setValue("teamId", team.id.toString());
                              }}
                            />
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedClientId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  selectedClientId
                                    ? "Select a team..."
                                    : "Select a client first"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams?.map((team: any) => (
                              <SelectItem
                                key={team.id}
                                value={team.id.toString()}
                              >
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload onTranscriptUploaded={handleTranscriptUploaded} />
                  {uploadedTranscript && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="text-pwc-green" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {uploadedTranscript.filename}
                          </p>
                          <p className="text-xs text-slate-500">
                            Uploaded successfully
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* BRD Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>BRD Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="processArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Process Area</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select process area..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(processAreaLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetSystem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target System</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target system..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(targetSystemLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BRD Template</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">
                              Standard BRD Template
                            </SelectItem>
                            <SelectItem value="agile">
                              Agile User Stories Format
                            </SelectItem>
                            <SelectItem value="detailed">
                              Detailed Technical Specification
                            </SelectItem>
                            <SelectItem value="executive">
                              Executive Summary Focus
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="analysisDepth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analysis Depth</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="basic" id="basic" />
                              <Label htmlFor="basic">Basic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="detailed" id="detailed" />
                              <Label htmlFor="detailed">Detailed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="comprehensive"
                                id="comprehensive"
                              />
                              <Label htmlFor="comprehensive">
                                Comprehensive
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-pwc-blue hover:bg-blue-600"
                    disabled={isGenerating || !uploadedTranscript}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate BRD"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>

        {/* Generation Progress */}
        {isGenerating && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 border-4 border-pwc-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-900">
                    Generating BRD...
                  </h3>
                  <p className="text-sm text-slate-500">
                    Analyzing transcript content and generating requirements...
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={generationProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* BRD Output */}
        {currentBrd && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Generated Business Requirements Document
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Generated on{" "}
                    {new Date(currentBrd.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setCurrentBrd(null)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New BRD
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="bg-pwc-blue hover:bg-blue-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BrdDisplay brd={currentBrd} />
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent BRD Generation History</CardTitle>
          </CardHeader>
          <CardContent>
            {brdHistory && brdHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Process Area</TableHead>
                    <TableHead>Target System</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brdHistory.map((brd: any) => (
                    <TableRow key={brd.id}>
                      <TableCell>
                        {new Date(brd.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{brd.clientName}</TableCell>
                      <TableCell>
                        {
                          processAreaLabels[
                            brd.processArea as keyof typeof processAreaLabels
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        {
                          targetSystemLabels[
                            brd.targetSystem as keyof typeof targetSystemLabels
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            brd.status === "completed"
                              ? "default"
                              : brd.status === "generating"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {brd.status === "completed" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {brd.status === "generating" && (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {brd.status === "failed" && (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {brd.status.charAt(0).toUpperCase() +
                            brd.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {brd.status === "completed" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setCurrentBrd(brd)}
                              className="text-pwc-blue p-0"
                            >
                              View
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No BRDs generated yet. Upload a transcript and generate your
                first BRD!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
