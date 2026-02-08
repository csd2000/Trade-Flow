import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Clock, ChevronLeft, ChevronRight, FileText, Video, Users, ExternalLink, Printer, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { TradingCalculators } from "@/components/trading-calculators";
import { useTTS } from "@/hooks/use-tts";

interface TrainingModule {
  id: string;
  trackId?: string;
  track?: string;
  slug: string;
  order: number;
  of: number;
  title: string;
  duration?: string;
  overview?: string;
  prerequisites?: string[];
  steps?: string[];
  notesPrompt?: string;
  notes_prompt?: string;
  resources?: {
    video?: { label: string; url: string };
    pdf?: { label: string; url: string };
    community?: { label: string; url: string };
  };
  additionalResources?: Array<{ label: string; url: string }>;
  additional_resources?: Array<{ label: string; url: string }>;
  previous?: { label: string; slug: string } | null;
  next?: { label: string; slug: string } | null;
}

export default function AcademyModuleTraining() {
  // Check both route patterns for backwards compatibility
  const [matchAcademy, paramsAcademy] = useRoute("/academy/module/:track/:slug");
  const [matchTraining, paramsTraining] = useRoute("/training/:trackId/:moduleSlug");
  const [notes, setNotes] = useState("");
  const { speakSelected, stop, isPlaying, isLoading: ttsLoading, error: ttsError } = useTTS();

  // Use whichever route matched
  const match = matchAcademy || matchTraining;
  const params = paramsAcademy || paramsTraining;
  const track = params?.track || params?.trackId;
  const slug = params?.slug || params?.moduleSlug;

  // Load saved notes from localStorage
  useEffect(() => {
    if (track && slug) {
      const savedNotes = localStorage.getItem(`training-notes-${track}-${slug}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [track, slug]);

  // Save notes to localStorage
  const saveNotes = (newNotes: string) => {
    setNotes(newNotes);
    if (track && slug) {
      localStorage.setItem(`training-notes-${track}-${slug}`, newNotes);
    }
  };

  const { data: module, isLoading, error } = useQuery<TrainingModule>({
    queryKey: ['/api/training', track, slug],
    enabled: !!(track && slug),
  });

  const handlePrint = () => {
    window.print();
  };

  const openResource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReadForMe = () => {
    if (isPlaying) {
      stop();
      return;
    }
    speakSelected();
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  if (!match) {
    return <div>Route not found</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Module Not Found</CardTitle>
              <CardDescription>
                The training module you're looking for doesn't exist or couldn't be loaded.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto print:max-w-none">
          {/* Header */}
          <div className="mb-8 print:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/strategies'}
                  className="print:hidden"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Strategies
                </Button>
                <Badge variant="outline" className="print:hidden">
                  Module {module.order} of {module.of}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReadForMe}
                  className="print:hidden"
                  data-testid="button-read-for-me"
                  disabled={ttsLoading}
                  title="Highlight text first, then click to read aloud"
                >
                  {ttsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : isPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Read Selection
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="print:hidden"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Module
                </Button>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 print:text-2xl">
              {module.title}
            </h1>
            {module.duration && (
              <div className="flex items-center text-gray-600 dark:text-gray-200">
                <Clock className="w-4 h-4 mr-2" />
                <span>{module.duration}</span>
              </div>
            )}
          </div>

          {/* Overview */}
          {module.overview && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {module.overview}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {module.prerequisites && module.prerequisites.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {module.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          {module.steps && module.steps.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Step-by-Step Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {module.steps.map((step, index) => {
                    // Handle both string steps and object steps
                    const isObject = typeof step === 'object' && step !== null;
                    const stepTitle = isObject ? (step as any).title : null;
                    const stepContent = isObject ? (step as any).content : step;
                    const stepType = isObject ? (step as any).type : 'text';
                    
                    return (
                      <li key={index} className="flex">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold mr-4 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          {stepTitle && (
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{stepTitle}</h4>
                          )}
                          {stepType === 'list' && Array.isArray(stepContent) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {stepContent.map((item, i) => (
                                <li key={i} className="text-gray-700 dark:text-gray-300">{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{stepContent}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Trading Calculators - Show on Risk Management and Strategy modules */}
          {(module.order === 4 || module.title?.toLowerCase().includes('risk') || module.title?.toLowerCase().includes('position')) && (
            <div className="mb-6 print:hidden">
              <TradingCalculators />
            </div>
          )}

          {/* Resources */}
          {module.resources && (
            <Card className="mb-6 print:hidden">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {module.resources.video && (
                    <Button
                      variant="outline"
                      onClick={() => openResource(module.resources!.video!.url)}
                      className="flex items-center justify-center h-20"
                    >
                      <Video className="w-6 h-6 mr-2" />
                      <div>
                        <div className="font-semibold">{module.resources.video.label}</div>
                        <div className="text-xs text-gray-300">Watch Tutorial</div>
                      </div>
                    </Button>
                  )}
                  {module.resources.pdf && (
                    <Button
                      variant="outline"
                      onClick={() => openResource(module.resources!.pdf!.url)}
                      className="flex items-center justify-center h-20"
                    >
                      <FileText className="w-6 h-6 mr-2" />
                      <div>
                        <div className="font-semibold">{module.resources.pdf.label}</div>
                        <div className="text-xs text-gray-300">Download PDF</div>
                      </div>
                    </Button>
                  )}
                  {module.resources.community && (
                    <Button
                      variant="outline"
                      onClick={() => openResource(module.resources!.community!.url)}
                      className="flex items-center justify-center h-20"
                    >
                      <Users className="w-6 h-6 mr-2" />
                      <div>
                        <div className="font-semibold">{module.resources.community.label}</div>
                        <div className="text-xs text-gray-300">Join Community</div>
                      </div>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Resources */}
          {((module.additionalResources && module.additionalResources.length > 0) || (module.additional_resources && module.additional_resources.length > 0)) && (
            <Card className="mb-6 print:hidden">
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(module.additionalResources || module.additional_resources || []).map((resource, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => openResource(resource.url)}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {resource.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Your Notes</CardTitle>
              {(module.notesPrompt || module.notes_prompt) && (
                <CardDescription>{module.notesPrompt || module.notes_prompt}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Take notes about your progress, questions, and insights..."
                value={notes}
                onChange={(e) => saveNotes(e.target.value)}
                className="min-h-32 print:hidden"
              />
              {/* Show notes in print mode */}
              <div className="hidden print:block">
                <div className="border border-gray-300 rounded p-4 min-h-32 whitespace-pre-wrap">
                  {notes || "No notes taken yet."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center print:hidden">
            <div>
              {module.previous && (
                <Button variant="outline" asChild>
                  <a href={`/academy/module/${track}/${module.previous.slug}`}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {module.previous.label}
                  </a>
                </Button>
              )}
            </div>
            <div>
              {module.next && (
                <Button asChild>
                  <a href={`/academy/module/${track}/${module.next.slug}`}>
                    {module.next.label}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}