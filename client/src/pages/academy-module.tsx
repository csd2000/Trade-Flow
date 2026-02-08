import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Book, 
  Play, 
  FileText, 
  Users, 
  ExternalLink,
  Printer,
  Save
} from 'lucide-react';

type ResLink = { label: string; url: string };

type Module = {
  slug: string;
  track: string;
  order: number;
  of: number;
  title: string;
  duration: string;
  overview: string;
  prerequisites: string[];
  steps: string[];
  notes_prompt?: string;
  resources?: {
    video?: ResLink;
    pdf?: ResLink;
    community?: ResLink;
  };
  additional_resources?: ResLink[];
  previous?: { label: string; slug: string } | null;
  next?: { label: string; slug: string } | null;
};

export default function TrainingModule() {
  const [, params] = useRoute('/academy/module/:slug');
  const slug = params?.slug;
  const [mod, setMod] = useState<Module | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    setIsLoading(true);
    fetch(`/api/training/modules/${slug}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error('Module not found');
        }
        return r.json();
      })
      .then((data) => {
        setMod(data);
        const saved = localStorage.getItem(`tn-notes-${data.slug}`) || "";
        setNotes(saved);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching module:', err);
        setError('Module not found or failed to load');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  const saveNotes = () => {
    if (!mod) return;
    localStorage.setItem(`tn-notes-${mod.slug}`, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 text-white max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
            <p className="text-gray-300 mb-4">{error || 'The requested training module could not be found.'}</p>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{mod.title}</h1>
            <div className="flex items-center gap-4 text-gray-300">
              <span className="capitalize">{mod.track.replace(/-/g, " ")}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {mod.duration}
              </div>
              <span>•</span>
              <span>Module {mod.order} of {mod.of}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Academy
            </Button>
          </div>
        </div>

        {/* Save confirmation */}
        {notesSaved && (
          <Alert className="mb-6 bg-green-500/20 border-green-500/30 text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Notes saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Overview & Prerequisites */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-400" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{mod.overview}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mod.prerequisites?.map((prereq, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    {prereq}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Content & Notes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-400" />
                Content — Step by Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {mod.steps?.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="leading-relaxed">{step}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Notes
              </CardTitle>
              <CardDescription className="text-gray-200">
                {mod.notes_prompt || "Use this space to write your notes."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-40 bg-white/5 border-white/20 text-white placeholder:text-gray-200 resize-none"
                placeholder="Type your notes here…"
              />
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={saveNotes} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
                <Button 
                  onClick={() => setNotes("")} 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resources */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {mod.resources?.video && (
                <a 
                  href={mod.resources.video.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Play className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <div className="font-medium">{mod.resources.video.label}</div>
                    <div className="text-sm text-gray-200">Video Tutorial</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-200" />
                </a>
              )}

              {mod.resources?.pdf && (
                <a 
                  href={mod.resources.pdf.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <div className="font-medium">{mod.resources.pdf.label}</div>
                    <div className="text-sm text-gray-200">PDF Guide</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-200" />
                </a>
              )}

              {mod.resources?.community && (
                <a 
                  href={mod.resources.community.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Users className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <div className="font-medium">{mod.resources.community.label}</div>
                    <div className="text-sm text-gray-200">Community</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-200" />
                </a>
              )}
            </div>

            {mod.additional_resources?.length ? (
              <div>
                <h3 className="font-medium text-lg mb-3">Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mod.additional_resources.map((resource, i) => (
                    <a 
                      key={i} 
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors" 
                      href={resource.url} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {resource.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {mod.previous ? (
            <Button
              onClick={() => window.location.href = `/academy/module/${mod.previous!.slug}`}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {mod.previous.label}
            </Button>
          ) : (
            <div className="text-gray-300">Start of course</div>
          )}

          {mod.next ? (
            <Button
              onClick={() => window.location.href = `/academy/module/${mod.next!.slug}`}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {mod.next.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="text-gray-300">End of course</div>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          button, .cursor-pointer, a[target="_blank"] { display: none !important; }
          body { background: #fff !important; color: #111 !important; }
          .bg-gradient-to-br { background: #fff !important; }
          .text-white { color: #111 !important; }
          .text-gray-300, .text-gray-200 { color: #666 !important; }
          .bg-white\\/10, .bg-white\\/5 { background: #f9f9f9 !important; border: 1px solid #ddd !important; }
          .border-white\\/20, .border-white\\/10 { border-color: #ddd !important; }
        }
        `
      }} />
    </div>
  );
}