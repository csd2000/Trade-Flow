import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Content data type
type ContentData = {
  id: string;
  title: string;
  body: string;
  path: string;
  data: any;
  lastModified: string;
  updatedBy?: string | null;
};

// Type guard for ContentData
function isContentData(x: unknown): x is ContentData {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.body === "string" &&
    typeof o.path === "string"
  );
}

export default function AdminContent() {
  const [contentPath, setContentPath] = useState("/academy/module/passive-income-training/passive-income-module-1");
  const [content, setContent] = useState("{}");
  const [isEdited, setIsEdited] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load content
  const { data: rawContentData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/content', contentPath],
    queryFn: () => apiRequest(`/api/admin/content?path=${encodeURIComponent(contentPath)}`, 'GET'),
    enabled: !!contentPath,
  });

  // Parse and validate the content data
  const contentData: ContentData | null = rawContentData && isContentData(rawContentData) ? rawContentData : null;

  // Save content mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      try {
        const parsedContent = JSON.parse(content);
        return await apiRequest('/api/admin/content', 'POST', {
          path: contentPath,
          data: parsedContent
        });
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }
    },
    onSuccess: () => {
      toast({
        title: "Content saved",
        description: "Your changes have been saved successfully.",
      });
      setIsEdited(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save content",
        variant: "destructive",
      });
    },
  });

  const handleLoad = () => {
    if (contentData) {
      setContent(JSON.stringify(contentData.data, null, 2));
      setIsEdited(false);
    }
    refetch();
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsEdited(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  // Predefined content paths for quick selection
  const quickPaths = [
    "/academy/module/passive-income-training/passive-income-module-1",
    "/academy/module/passive-income-training/passive-income-module-2",
    "/academy/module/passive-income-training/passive-income-module-3",
    "/academy/module/passive-income-training/passive-income-module-4",
    "/academy/module/passive-income-training/passive-income-module-5",
    "/academy/module/passive-income-training/passive-income-module-6",
    "/academy/module/passive-income-training/passive-income-module-7",
    "/academy/module/passive-income-training/passive-income-module-8",
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Content Management</h1>
              <p className="text-gray-300">
                Edit training modules and platform content
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/admin'}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Path Input */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content-path">Content Path</Label>
                    <Input
                      id="content-path"
                      value={contentPath}
                      onChange={(e) => setContentPath(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-200"
                      placeholder="/academy/module/..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleLoad} 
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Load
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={!isEdited || saveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {saveMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    {isEdited && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unsaved Changes
                      </Badge>
                    )}
                    {contentData?.lastModified && (
                      <div className="text-xs text-gray-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last modified: {new Date(contentData.lastModified).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Paths */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Access</CardTitle>
                  <CardDescription className="text-gray-200">
                    Common content paths
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {quickPaths.map((path) => (
                      <button
                        key={path}
                        onClick={() => setContentPath(path)}
                        className={`w-full text-left text-xs p-2 rounded hover:bg-white/10 transition-colors ${
                          contentPath === path ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300'
                        }`}
                      >
                        {path.split('/').pop()}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Content Editor</span>
                  {contentData && (
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Loaded
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-200">
                  JSON content editor with syntax validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!contentData ? (
                    <Alert className="bg-blue-500/20 border-blue-500/30 text-blue-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Enter a content path and click "Load" to start editing content.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Textarea
                        value={content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full min-h-[600px] bg-white/5 border-white/20 text-white placeholder:text-gray-200 font-mono text-sm"
                        placeholder="JSON content will appear here..."
                      />
                      
                      {/* JSON Validation */}
                      <div className="text-sm">
                        {(() => {
                          try {
                            JSON.parse(content);
                            return (
                              <div className="text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Valid JSON
                              </div>
                            );
                          } catch (error) {
                            return (
                              <div className="text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Invalid JSON: {(error as Error).message}
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* Content Info */}
                      {contentData && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-200">Path:</span> {contentData.path}
                          </div>
                          <div>
                            <span className="text-gray-200">Updated by:</span> {contentData.updatedBy || 'System'}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}