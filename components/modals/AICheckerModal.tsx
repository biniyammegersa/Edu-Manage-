'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, CheckCircle2, AlertTriangle, Loader2, FileText, Wand2, AlignLeft,
} from 'lucide-react';
import api from '@/lib/api';

interface AICheckerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialText?: string;
}

type Mode = 'grammar' | 'summary' | 'clarity';

interface ClarityResult {
  writingScore?: number;
  grammarScore?: number;
  clarityScore?: number;
  suggestions?: string;
}

export function AICheckerModal({ open, onOpenChange, initialText = '' }: AICheckerModalProps) {
  const [text, setText] = useState(initialText);
  const [mode, setMode] = useState<Mode>('clarity');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [clarityData, setClarityData] = useState<ClarityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Please enter at least 20 characters of text to analyze.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setClarityData(null);
    setError(null);
    try {
      const res = await api.post('/ai/check', { text, mode });
      const data = res.data;
      if (mode === 'clarity') {
        setClarityData({
          writingScore: data.writingScore,
          grammarScore: data.grammarScore,
          clarityScore: data.clarityScore,
          suggestions:  data.suggestions ?? data.raw,
        });
      } else {
        setResult(data.result ?? data.raw ?? '');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'AI service error.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreBar = ({ label, score }: { label: string; score?: number }) => {
    if (score == null) return null;
    const color = score >= 8 ? 'text-emerald-600' : score >= 5 ? 'text-amber-600' : 'text-red-600';
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-muted-foreground">{label}</span>
          <span className={`font-bold ${color}`}>{score}/10</span>
        </div>
        <Progress value={score * 10} className="h-2" />
      </div>
    );
  };

  const reset = () => {
    setResult(null);
    setClarityData(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            AI Writing Assistant
          </DialogTitle>
          <DialogDescription>
            Powered by DeepSeek — grammar correction, summarization, and clarity scoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); reset(); }}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="clarity" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Clarity Score
              </TabsTrigger>
              <TabsTrigger value="grammar" className="gap-1.5">
                <Wand2 className="h-3.5 w-3.5" /> Grammar Fix
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-1.5">
                <AlignLeft className="h-3.5 w-3.5" /> Summarize
              </TabsTrigger>
            </TabsList>

            {(['clarity', 'grammar', 'summary'] as Mode[]).map((m) => (
              <TabsContent key={m} value={m} className="mt-4 space-y-4">
                <Textarea
                  placeholder={
                    m === 'clarity' ? 'Paste your abstract or section for scoring…'
                    : m === 'grammar' ? 'Paste text to correct grammar and spelling…'
                    : 'Paste the abstract to summarize in 3 sentences…'
                  }
                  value={text}
                  onChange={(e) => { setText(e.target.value); reset(); }}
                  className="min-h-[140px] resize-none rounded-xl text-sm"
                />

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Analyzing with DeepSeek…</p>
                  </div>
                )}

                {/* Clarity results */}
                {m === 'clarity' && clarityData && !isLoading && (
                  <div className="space-y-4 rounded-xl border bg-card p-4">
                    <ScoreBar label="Writing Quality" score={clarityData.writingScore} />
                    <ScoreBar label="Grammar"         score={clarityData.grammarScore} />
                    <ScoreBar label="Clarity"         score={clarityData.clarityScore} />
                    {clarityData.suggestions && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Suggestions</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {clarityData.suggestions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Grammar / Summary results */}
                {(m === 'grammar' || m === 'summary') && result && !isLoading && (
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {m === 'grammar' ? 'Corrected' : 'Summary'}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{result}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || text.trim().length < 20}
                    className="flex-1 gap-2 rounded-full"
                  >
                    {isLoading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
                      : <><Sparkles className="h-4 w-4" /> Analyze</>}
                  </Button>
                  {(result || clarityData) && (
                    <Button variant="outline" onClick={reset} className="rounded-full">
                      Clear
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
                    <FileText className="h-4 w-4 mr-1" /> Done
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
