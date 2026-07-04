import { Sparkles, BrainCircuit, FileText, Search, ArrowRight, CheckCircle2, RefreshCw, Layers, ChevronDown, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateSummary, generateFlashcards, answerConcept } from '../lib/gemini';

interface Resource {
  id: string;
  title: string;
  subject: string;
  file_url: string;
}

const SmartStuff = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'summary' | 'flashcards' | 'partners'>('search');
  
  // Resource Selection State
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [isFetchingResources, setIsFetchingResources] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  // Concept Query State
  const [searchVal, setSearchVal] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  
  // Summarizer State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string[] | null>(null);

  // Flashcards State
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState<{q: string, a: string}[] | null>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Global Error State for AI Actions
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    fetchPdfResources();
  }, [user]);

  const fetchPdfResources = async () => {
    setIsFetchingResources(true);
    try {
      // Only fetch PDFs since our AI implementation handles PDFs natively right now
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, subject, file_url')
        .eq('file_type', 'PDF')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err: unknown) {
      setResourceError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setIsFetchingResources(false);
    }
  };

  const getBase64File = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // result is "data:application/pdf;base64,JVBERi..."
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: blob.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSearch = async () => {
    if (!searchVal.trim() || !selectedResourceId) {
      setAiError("Please select a resource and enter a question.");
      return;
    }
    
    setAiError(null);
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const resource = resources.find(r => r.id === selectedResourceId);
      if (!resource) throw new Error("Resource not found");

      const { base64, mimeType } = await getBase64File(resource.file_url);
      const answer = await answerConcept(searchVal, base64, mimeType);
      
      setSearchResult(answer);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Failed to process concept query.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedResourceId) {
      setAiError("Please select a resource to summarize.");
      return;
    }

    setAiError(null);
    setIsSummarizing(true);
    setSummaryResult(null);
    
    try {
      const resource = resources.find(r => r.id === selectedResourceId);
      if (!resource) throw new Error("Resource not found");

      const { base64, mimeType } = await getBase64File(resource.file_url);
      const points = await generateSummary(base64, mimeType);
      
      setSummaryResult(points);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedResourceId) {
      setAiError("Please select a resource to generate flashcards.");
      return;
    }

    setAiError(null);
    setIsGeneratingFlashcards(true);
    setFlashcards(null);
    setActiveCard(0);
    setShowAnswer(false);
    
    try {
      const resource = resources.find(r => r.id === selectedResourceId);
      if (!resource) throw new Error("Resource not found");

      const { base64, mimeType } = await getBase64File(resource.file_url);
      const generatedCards = await generateFlashcards(base64, mimeType);
      
      setFlashcards(generatedCards);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Failed to generate flashcards.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Render a common resource selector for the top of the AI tabs
  const ResourceSelector = () => (
    <div className="mb-6 space-y-2">
      <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Select Source Material</label>
      {isFetchingResources ? (
        <div className="text-gray-400 text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Loading your files...</div>
      ) : resourceError ? (
        <div className="text-red-400 text-sm">{resourceError}</div>
      ) : (
        <div className="relative">
          <select 
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="w-full appearance-none bg-[#0B0B0B] border border-gold-border/40 text-white rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
          >
            <option value="">-- Choose a PDF from your uploads --</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>{r.title} ({r.subject})</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-500 pointer-events-none" />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 bg-transparent">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
          <Sparkles className="h-3 w-3" /> AI-Powered Hub
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
          Smart <span className="text-gradient">Stuff</span>
        </h1>
        <p className="text-gray-400 text-lg sm:text-xl font-medium leading-relaxed">
          Supercharge your study workflow with real AI tools. Query concepts naturally, summarize materials instantly, and generate smart flashcards directly from your uploaded files.
        </p>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Tabs */}
        <div className="lg:col-span-4 space-y-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-brand-500/10 to-transparent border-brand-500/40 shadow-gold-soft'
                : 'bg-surface-100/50 border-gold-border/20 hover:border-gold-border/40 hover:bg-surface-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${activeTab === 'search' ? 'bg-brand-500 text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Concept Query</h3>
                <p className="text-gray-400 text-xs mt-1">Ask questions and search notes by core ideas, not just words.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'summary'
                ? 'bg-gradient-to-r from-brand-500/10 to-transparent border-brand-500/40 shadow-gold-soft'
                : 'bg-surface-100/50 border-gold-border/20 hover:border-gold-border/40 hover:bg-surface-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${activeTab === 'summary' ? 'bg-brand-500 text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Instant Summaries</h3>
                <p className="text-gray-400 text-xs mt-1">Distill long documents and lectures into concise study guides.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'flashcards'
                ? 'bg-gradient-to-r from-brand-500/10 to-transparent border-brand-500/40 shadow-gold-soft'
                : 'bg-surface-100/50 border-gold-border/20 hover:border-gold-border/40 hover:bg-surface-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${activeTab === 'flashcards' ? 'bg-brand-500 text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Smart Flashcards</h3>
                <p className="text-gray-400 text-xs mt-1">Convert lecture topics into active recall training cards.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'partners'
                ? 'bg-gradient-to-r from-brand-500/10 to-transparent border-brand-500/40 shadow-gold-soft'
                : 'bg-surface-100/50 border-gold-border/20 hover:border-gold-border/40 hover:bg-surface-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${activeTab === 'partners' ? 'bg-brand-500 text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Study Partners</h3>
                <p className="text-gray-400 text-xs mt-1">Recommended learning sites and how they help you.</p>
              </div>
            </div>
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-8 glass-card border border-gold-border/30 bg-[#111111]/60 backdrop-blur-xl p-8 rounded-3xl min-h-[400px]">
          
          {aiError && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm font-medium">{aiError}</p>
            </div>
          )}

          {/* TAB 1: CONCEPT QUERY */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-brand-500" /> Concept Query
              </h3>
              <p className="text-gray-400 text-sm">
                Select one of your uploaded PDF materials, ask a question, and the AI will analyze the document to provide a tailored answer.
              </p>
              
              <ResourceSelector />

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-[#0B0B0B] border border-gold-border/40 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                    placeholder="E.g., What is the syllabus for Module 1?"
                    disabled={isSearching}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !selectedResourceId || !searchVal.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:scale-105 transition-transform text-black rounded-lg disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {isSearching && (
                  <div className="flex items-center gap-3 text-brand-400 py-4 justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-semibold">Gemini AI is analyzing the document...</span>
                  </div>
                )}

                {searchResult && (
                  <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gold-border/20 text-white leading-relaxed animate-fade-in text-sm relative overflow-hidden whitespace-pre-wrap">
                    <div className="absolute top-0 right-0 p-2 bg-brand-500/10 border-l border-b border-brand-500/20 text-brand-400 text-[10px] uppercase font-bold tracking-widest rounded-bl-xl">
                      AI Synthesis
                    </div>
                    {searchResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUMMARIES */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" /> Document Summarizer
              </h3>
              <p className="text-gray-400 text-sm">
                Select a document from your uploads and Gemini will instantly extract the most important bullet points.
              </p>

              <ResourceSelector />

              <div className="space-y-4">
                {!isSummarizing && !summaryResult && (
                  <button
                    onClick={handleSummarize}
                    disabled={!selectedResourceId}
                    className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 font-bold text-black rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Summarize Document <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {isSummarizing && (
                  <div className="flex items-center gap-3 text-brand-400 py-4 justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-semibold">Running Gemini summary models...</span>
                  </div>
                )}

                {summaryResult && (
                  <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-gold-border/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase text-brand-500 font-bold tracking-widest">Key Takeaways</h4>
                      <button 
                        onClick={() => setSummaryResult(null)} 
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                    <ul className="space-y-3">
                      {summaryResult.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-200">
                          <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SMART FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" /> Active Recall Flashcards
              </h3>
              <p className="text-gray-400 text-sm">
                Generate bite-sized active recall questions from your study materials automatically.
              </p>

              <ResourceSelector />

              {!flashcards && !isGeneratingFlashcards && (
                 <button
                 onClick={handleGenerateFlashcards}
                 disabled={!selectedResourceId}
                 className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 font-bold text-black rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
               >
                 Generate Flashcards <ArrowRight className="h-4 w-4" />
               </button>
              )}

              {isGeneratingFlashcards && (
                <div className="flex items-center gap-3 text-brand-400 py-4 justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-semibold">Gemini AI is crafting questions...</span>
                </div>
              )}

              {flashcards && (
                <>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Card {activeCard + 1} of {flashcards.length}</span>
                    <button onClick={() => setFlashcards(null)} className="font-semibold text-brand-500 hover:text-brand-400">Generate New</button>
                  </div>

                  {/* Flipping Card Container */}
                  <div 
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="h-48 border border-gold-border/20 rounded-2xl bg-[#0B0B0B] hover:border-brand-500/30 transition-all cursor-pointer p-6 flex flex-col items-center justify-center text-center relative overflow-hidden select-none"
                  >
                    <div className="absolute top-2 right-3 text-[10px] uppercase font-bold tracking-wider text-brand-500/60">
                      {showAnswer ? "ANSWER" : "QUESTION"}
                    </div>
                    
                    <p className="text-lg font-bold text-white max-w-lg leading-relaxed">
                      {showAnswer ? flashcards[activeCard].a : flashcards[activeCard].q}
                    </p>
                    
                    <span className="text-xs text-gray-500 mt-4 absolute bottom-4">
                      {showAnswer ? "Click to see question" : "Click anywhere to reveal answer"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      disabled={activeCard === 0}
                      onClick={() => { setActiveCard(prev => prev - 1); setShowAnswer(false); }}
                      className="px-6 py-2.5 border border-gold-border/30 rounded-xl text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={activeCard === flashcards.length - 1}
                      onClick={() => { setActiveCard(prev => prev + 1); setShowAnswer(false); }}
                      className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl text-sm font-bold text-black hover:scale-102 transition-transform disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Next Card
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: STUDY PARTNERS */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-500" /> Curated Learning Ecosystem
              </h3>
              <p className="text-gray-400 text-sm">
                Explore recommended educational platforms and AI tools integrated into your study flow to maximize retention and skill acquisition.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "LearnKata.ai",
                    url: "https://learnkata.ai/",
                    logo: "/platforms/learnkata.png",
                    desc: "Interactive AI coding and interview preparation portal designed to build core software engineering skills.",
                    features: ["Custom programming pathways", "Real-time AI structure review", "Mock technical interviews"],
                    help: "Accelerates hands-on coding ability and prepares you to clear rigorous placement tests and coding challenges."
                  },
                  {
                    name: "Mindgrasp.ai",
                    url: "https://www.mindgrasp.ai/",
                    logo: "/platforms/mindgrasp.png",
                    desc: "An advanced AI-powered assistant that reads text, documents, or lecture videos and distills core concepts.",
                    features: ["Instant audio/video summarization", "Auto-quizzes & flashcards", "Chat-to-document capabilities"],
                    help: "Reduces lecture-review time by 70%, converting massive reference textbooks or classes into bite-sized summaries."
                  },
                  {
                    name: "W3Schools",
                    url: "https://www.w3schools.com/",
                    logo: "/platforms/w3schools.png",
                    desc: "The world's largest web developer tutorial platform, offering interactive language courses.",
                    features: ["Structured web-tech lessons", "In-browser live sandbox code tests", "Developer certifications"],
                    help: "Serves as the perfect starting point for learning HTML/CSS, JavaScript, SQL, and database essentials with instant feedback."
                  },
                  {
                    name: "GeeksforGeeks",
                    url: "https://www.geeksforgeeks.org/",
                    logo: "/platforms/geeksforgeeks.png",
                    desc: "A massive, comprehensive learning index for computer science concepts, database tutorials, and algorithms.",
                    features: ["DSA reference guidebooks", "Engineering syllabus tutorials", "Placement and GATE exam prep"],
                    help: "Acts as the ultimate dictionary for technical homework reference, DSA preparations, and coding assignment solutions."
                  }
                ].map((partner, i) => (
                  <div key={i} className="flex flex-col justify-between p-5 rounded-2xl border border-gold-border/20 bg-[#0B0B0B] hover:border-brand-500/30 transition-all group">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-[#222]">
                           {/* Using fallback div with text if logo image is broken */}
                           <span className="text-white text-[10px] flex h-full items-center justify-center font-bold text-center">{partner.name.substring(0,3)}</span>
                        </div>
                        <h4 className="font-bold text-white group-hover:text-brand-400 transition-colors">{partner.name}</h4>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed mb-4">{partner.desc}</p>
                      
                      <div className="space-y-2 mb-4">
                        <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">Key Features</span>
                        <ul className="text-[11px] text-gray-300 space-y-1 list-disc pl-4">
                          {partner.features.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      </div>

                      <div className="space-y-1 mb-4">
                        <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">How it helps you</span>
                        <p className="text-[11px] text-gray-300 leading-normal">{partner.help}</p>
                      </div>
                    </div>

                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 mt-2 self-start"
                    >
                      Visit Platform <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SmartStuff;
