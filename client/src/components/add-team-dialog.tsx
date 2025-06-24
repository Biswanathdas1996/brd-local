import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertTeamSchema } from "@shared/schema";
import { z } from "zod";

const teamFormSchema = insertTeamSchema.extend({
  clientId: z.string().min(1, "Client ID is required"),
});

type TeamFormData = z.infer<typeof teamFormSchema>;

interface AddTeamDialogProps {
  clientId: string;
  onTeamAdded: (team: any) => void;
}

export default function AddTeamDialog({ clientId, onTeamAdded }: AddTeamDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      clientId,
      name: "",
      focus: "",
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clientId: parseInt(data.clientId),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", clientId] });
      onTeamAdded(team);
      setOpen(false);
      form.reset();
      toast({
        title: "Team created successfully",
        description: `${team.name} has been added to your client.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeamFormData) => {
    createTeamMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plus className="h-4 w-4 mr-1" />
          Add Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Digital Banking Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="focus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Focus Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Core Banking, CRM Implementation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}