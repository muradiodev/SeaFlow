import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Manual } from "@shared/schema";
import { 
  Book, 
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  Calendar,
  User,
  Bookmark
} from "lucide-react";

export default function Manuals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [newManual, setNewManual] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });

  const { data: manuals, isLoading } = useQuery<Manual[]>({
    queryKey: searchQuery ? ["/api/manuals", { search: searchQuery }] : ["/api/manuals"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/manuals", {
        ...data,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : []
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuals"] });
      setIsCreateDialogOpen(false);
      setNewManual({ title: "", content: "", category: "", tags: "" });
      toast({
        title: "Manual created",
        description: "The manual has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create manual.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newManual);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch due to queryKey dependency
  };

  const canEditManuals = user?.role === 'dpa' || user?.role === 'superintendent';

  // Group manuals by category
  const groupedManuals = manuals?.reduce((acc, manual) => {
    const category = manual.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(manual);
    return acc;
  }, {} as Record<string, Manual[]>) || {};

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Manuals" breadcrumb={["Home", "Manuals"]} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with Search and Actions */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Operations Manuals</h2>
            {canEditManuals && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-maritime-600 hover:bg-maritime-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manual
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Manual</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newManual.title}
                        onChange={(e) => setNewManual({...newManual, title: e.target.value})}
                        placeholder="Enter manual title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newManual.category}
                        onChange={(e) => setNewManual({...newManual, category: e.target.value})}
                        placeholder="Enter category (e.g., Safety, Navigation, Engineering)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={newManual.tags}
                        onChange={(e) => setNewManual({...newManual, tags: e.target.value})}
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={newManual.content}
                        onChange={(e) => setNewManual({...newManual, content: e.target.value})}
                        placeholder="Enter manual content"
                        rows={10}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-maritime-600 hover:bg-maritime-700"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? "Creating..." : "Create Manual"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search manuals, procedures, equipment..."
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>

        {/* Manuals Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading manuals...</div>
          </div>
        ) : Object.keys(groupedManuals).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedManuals).map(([category, categoryManuals]) => (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-4">
                  <Bookmark className="h-5 w-5 text-maritime-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <Badge variant="outline">{categoryManuals.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryManuals.map((manual) => (
                    <Card key={manual.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Book className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{manual.title}</h4>
                            <p className="text-sm text-gray-500">Version {manual.version}</p>
                          </div>
                        </div>
                        
                        {manual.content && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {manual.content.substring(0, 150)}...
                          </p>
                        )}
                        
                        {manual.tags && Array.isArray(manual.tags) && manual.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {manual.tags.slice(0, 3).map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {manual.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{manual.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(manual.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Updated</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedManual(manual)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {canEditManuals && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No manuals found' : 'No manuals available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No manuals match your search for "${searchQuery}"`
                : 'There are no manuals available at the moment.'
              }
            </p>
            {canEditManuals && !searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Manual
              </Button>
            )}
          </div>
        )}

        {/* Manual Viewer Dialog */}
        {selectedManual && (
          <Dialog open={!!selectedManual} onOpenChange={() => setSelectedManual(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  <span>{selectedManual.title}</span>
                  <Badge variant="outline">v{selectedManual.version}</Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedManual.category && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <p className="text-sm text-gray-600">{selectedManual.category}</p>
                  </div>
                )}
                
                {selectedManual.tags && Array.isArray(selectedManual.tags) && selectedManual.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedManual.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedManual.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(selectedManual.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Content</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="prose max-w-none">
                      {selectedManual.content?.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 text-sm text-gray-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedManual(null)}>
                  Close
                </Button>
                {canEditManuals && (
                  <Button className="bg-maritime-600 hover:bg-maritime-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Manual
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
