<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miss Ha's Feedback Studio ✨</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">{"imports": {"@google/generative-ai": "https://esm.run/@google/generative-ai"}}</script>
    <style>
        .excel-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border: 2px solid #fda4af; }
        .excel-table th, .excel-table td { border: 1px solid #fecdd3; padding: 12px; text-align: left; color: #4c0519; }
        .header-pink { background: #ffe4e6; color: #9f1239; font-weight: 800; text-transform: uppercase; font-size: 12px; text-align: center; }
        .badge-dat { background: #fef2f2; border: 1px solid #fecdd3; color: #e11d48; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: bold; }
    </style>
</head>
<body class="bg-[#fff1f2] min-h-screen p-4 font-sans text-rose-950">
    <div class="max-w-2xl mx-auto">
        <header class="mb-8 text-center">
            <h1 class="text-3xl font-black text-rose-600 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500">Miss Ha's Studio ✨</h1>
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-400 mt-2">HSG Speaking Evaluation 2026</p>
        </header>

        <div class="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-rose-200/50 border border-white">
            <div class="space-y-6">
                <div class="p-8 bg-rose-50/50 rounded-3xl border-2 border-dashed border-rose-200 text-center relative hover:bg-rose-100/50 transition-colors">
                    <input type="file" id="fileInput" accept="video/*,audio/*" class="absolute inset-0 opacity-0 cursor-pointer">
                    <span class="text-5xl">🎤</span>
                    <p id="fileName" class="text-sm font-bold text-rose-400 mt-3">Upload Student Recording</p>
                </div>
                <input type="text" id="studentName" placeholder="Student Name..." class="w-full px-6 py-4 rounded-2xl border border-rose-100 bg-white/50 focus:ring-4 focus:ring-rose-200/20 outline-none transition-all">
                <button id="go" class="w-full py-5 bg-gradient-to-r from-rose-500 to-orange-400 text-white rounded-2xl font-black shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all">GENERATE FEEDBACK 💌</button>
            </div>
            <p id="status" class="mt-6 text-center text-xs font-bold text-rose-500 hidden animate-pulse"></p>
        </div>

        <div id="result" class="mt-8 hidden">
            <div class="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-rose-50">
                <h3 class="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2"><span>📊</span> Evaluation Report</h3>
                <div id="content" class="overflow-x-auto"></div>
            </div>
        </div>
    </div>

    <script type="module">
        import { GoogleGenerativeAI } from "@google/generative-ai";
        // KEY FIXED DIRECTLY BELOW
        const genAI = new GoogleGenerativeAI("AIzaSyBVXrO7NOPdvgiZ40LKu5dgBMwg-dEhXPs");
        const btn = document.getElementById('go');
        const fileIn = document.getElementById('fileInput');

        fileIn.onchange = () => { if(fileIn.files[0]) document.getElementById('fileName').innerText = fileIn.files[0].name; };

        btn.onclick = async () => {
            if (!fileIn.files[0]) return alert("Please select a file first!");
            btn.disabled = true;
            document.getElementById('status').classList.remove('hidden');
            document.getElementById('status').innerText = "MISS HA IS LISTENING... 🎧";

            try {
                const reader = new FileReader();
                reader.readAsDataURL(fileIn.files[0]);
                reader.onload = async () => {
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const res = await model.generateContent([
                        `Teacher: Miss Ha. Student: ${document.getElementById('studentName').value || "Em"}. Analyze the speaking. Provide a full transcript in <transcript> tags and a professional evaluation table in HTML/Vietnamese. Use .excel-table, .header-pink, and .badge-dat classes.`,
                        { inlineData: { data: reader.result.split(',')[1], mimeType: fileIn.files[0].type } }
                    ]);
                    const text = await res.response.text();
                    // Extract table only
                    document.getElementById('content').innerHTML = text.replace(/<transcript>[\s\S]*?<\/transcript>/i, '').replace(/```html|```/g, '');
                    document.getElementById('result').classList.remove('hidden');
                    document.getElementById('status').innerText = "EVALUATION COMPLETE! 🏆";
                    btn.disabled = false;
                };
            } catch (e) { 
                alert("Error: " + e.message); 
                btn.disabled = false;
                document.getElementById('status').innerText = "Error occurred.";
            }
        };
    </script>
</body>
</html>

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [teacherName, setTeacherName] = useState(() => {
    return localStorage.getItem('teacherName') || 'Miss Ha';
  });
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [studentName, setStudentName] = useState('');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const markdownContainerRef = useRef<HTMLDivElement>(null);
  
  const groqKey = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
  const aiProvider = groqKey ? 'groq' : 'gemini';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < getLoadingStates(teacherName).length - 1 ? prev + 1 : prev));
      }, 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, teacherName]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setFeedback(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    maxSize: 24 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      if (fileRejections[0]?.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Please upload an audio/video clip under 24MB.');
      } else {
        setError('Invalid file format. Please upload video or audio.');
      }
    }
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setFeedback(null);
    setError(null);
    setStudentTranscript(null);
  };

  const processAIOutput = (text: string) => {
    const transcriptMatch = text.match(/<transcript>([\s\S]*?)<\/transcript>/i);
    if (transcriptMatch) {
      setStudentTranscript(transcriptMatch[1].trim());
    }
    let cleaned = text.replace(/<transcript>[\s\S]*?<\/transcript>/i, '').trim();
    cleaned = cleaned.replace(/^```(html|xml)?\s*/i, '').replace(/```$/i, '').trim();
    return cleaned;
  };

  const generateFeedbackGemini = async () => {
    // FIX 1: Use the correct Environment Variable name
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.NEXT_PUBLIC_GEMINI_API_KEY || "";
    
    if (!apiKey) {
        throw new Error("Missing Gemini API Key. Please add it to your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const filePart = await new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            inlineData: {
              data: base64,
              mimeType: file!.type
            }
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file!);
    });

    // FIX 2: Change model to gemini-1.5-flash for higher quota/speed
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { role: 'user', parts: [filePart, { text: getSystemPrompt(teacherName, studentName) }] }
      ]
    });

    return processAIOutput(response.text || '');
  };

  const generateFeedbackGroq = async () => {
    if (!groqKey) {
      throw new Error("Groq API Key is missing.");
    }
    
    const formData = new FormData();
    formData.append('file', file!);
    formData.append('model', 'whisper-large-v3');
    
    const transcribeRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}` },
      body: formData
    });
    
    if (!transcribeRes.ok) {
      const errData = await transcribeRes.json();
      throw new Error(errData.error?.message || 'Transcription failed');
    }
    
    const transcribeData = await transcribeRes.json();
    const transcript = transcribeData.text;
    setStudentTranscript(transcript);
    
    const evalRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: getSystemPrompt(teacherName, studentName) },
          { role: 'user', content: `Here is the student's speaking transcript to evaluate: "${transcript}"\n\n(Remember to output the <transcript> block first!)` }
        ]
      })
    });
    
    if (!evalRes.ok) {
      const errData = await evalRes.json();
      throw new Error(errData.error?.message || 'Evaluation failed');
    }
    
    const evalData = await evalRes.json();
    const text = evalData.choices[0].message.content;
    return processAIOutput(text);
  };

  const handleDownloadImage = async () => {
    if (!markdownContainerRef.current) return;
    try {
      setIsDownloading(true);
      setError(null);
      await new Promise(r => setTimeout(r, 400));
      const node = markdownContainerRef.current;
      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `${studentName || 'student'}-feedback.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError("Failed to generate image. Please try copying instead.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!feedback) return;
    try {
      await navigator.clipboard.writeText(feedback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Could not access clipboard.");
    }
  };

  const generateFeedback = async () => {
    if (!file) return;
    setIsGenerating(true);
    setError(null);
    setFeedback(null);
    setStudentTranscript(null);
    setLoadingStep(0);

    try {
      let resultText = '';
      if (aiProvider === 'gemini') {
        resultText = await generateFeedbackGemini();
      } else {
        resultText = await generateFeedbackGroq();
      }
      setFeedback(resultText);
    } catch (err: any) {
      // FIX 3: Friendly Error Handling for 429
      if (err.message?.includes('429')) {
        setError(`${teacherName} is taking a 60-second break! Please wait a moment and try again. ✨`);
      } else {
        setError(err.message || 'An error occurred while generating feedback.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 font-sans p-6 md:p-8 flex flex-col max-w-[1440px] mx-auto selection:bg-rose-200">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-rose-200/60 pb-6 gap-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transform -rotate-3 cursor-default">
            <span className="text-3xl">👩‍🏫</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-rose-950 tracking-tight flex items-center gap-2">
              {teacherName}'s Feedback Studio <span className="text-2xl">✨</span>
            </h1>
            <p className="text-sm text-rose-600/80 uppercase tracking-widest font-bold mt-1 flex items-center gap-2">
              Empowering English Learners
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[10px] lowercase">{aiProvider} engine</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white pr-4 pl-1.5 py-1.5 rounded-full shadow-sm border border-rose-100 transition-all">
             <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold text-sm tracking-tighter border-2 border-white shrink-0">
               {teacherName ? teacherName.substring(0, 2).toUpperCase() : 'T'}
             </div>
             {isEditingTeacher ? (
               <input 
                 autoFocus
                 type="text" 
                 value={teacherName} 
                 onChange={(e) => setTeacherName(e.target.value)} 
                 onBlur={() => {
                   setIsEditingTeacher(false);
                   localStorage.setItem('teacherName', teacherName);
                 }}
                 className="text-sm font-bold text-rose-800 bg-rose-50 border-none outline-none w-24 px-2 py-1 rounded"
               />
             ) : (
               <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsEditingTeacher(true)}>
                 <span className="text-sm font-bold text-rose-800">{teacherName}</span>
                 <Edit2 className="w-3 h-3 text-rose-300 group-hover:text-rose-500" />
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="flex flex-col md:flex-row gap-8 flex-1">
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-100/40 border border-rose-100 flex flex-col h-fit relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-10 opacity-60"></div>
            <label className="text-xs font-extrabold text-rose-400 uppercase mb-2 block tracking-wider">New Submission</label>
            <h2 className="text-2xl font-bold text-rose-950 mb-6">Let's review a student! 🎈</h2>
            
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-rose-800">Student Video/Audio</span>
                <span className="text-[10px] font-bold text-rose-400">Max 24MB</span>
              </div>
              <div 
                {...getRootProps()} 
                className={cn(
                  "h-32 w-full rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer",
                  isDragActive ? "border-rose-400 bg-white scale-[1.02]" : "border-rose-200 bg-white hover:border-rose-300",
                  file && "border-solid border-rose-300 bg-white"
                )}
              >
                <input {...getInputProps()} />
                {!file ? (
                    <div className="flex flex-col items-center justify-center text-center gap-2 w-full">
                      <Upload className="w-8 h-8 text-rose-300" />
                      <div className="text-xs text-slate-500 px-4">
                        <span className="font-bold text-rose-600">Click to upload</span> or drag
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-2 w-full px-4 relative">
                      {file.type.startsWith('video') ? <FileVideo className="w-8 h-8 text-blue-400" /> : <FileAudio className="w-8 h-8 text-blue-400" />}
                      <button onClick={clearFile} className="absolute -top-6 -right-2 p-1 bg-slate-800 rounded-full text-white"><Trash2 className="w-4 h-4" /></button>
                      <p className="text-xs font-medium text-slate-600 truncate w-full">{file.name}</p>
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-rose-800 mb-1 block">Student Name (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Nguyen Van A"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white shadow-sm focus:outline-none"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-2 border border-red-100">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); generateFeedback(); }}
              disabled={!file || isGenerating}
              className={cn(
                "mt-6 w-full py-4 px-4 rounded-2xl font-bold text-[15px] shadow-lg transition-all flex justify-center items-center gap-3",
                !file ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-rose-300/50 hover:shadow-rose-400/50 active:scale-[0.98]"
              )}
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : "Generate Feedback ✨"}
            </button>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-6 h-full min-h-[500px]">
          <AnimatePresence>
            {studentTranscript && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4"><AudioLines className="w-5 h-5 text-rose-600" /><h3 className="font-bold text-rose-950">Transcription</h3></div>
                <div className="p-5 bg-rose-50/50 border border-rose-100/50 rounded-2xl text-slate-700 italic">"{studentTranscript}"</div>
              </motion.div>
            )}
          </AnimatePresence>

          {feedback ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border border-rose-100 h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-rose-50 flex justify-between items-center">
                <h3 className="font-extrabold text-2xl text-rose-950">Feedback Ready! 💌</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleDownloadImage} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-rose-600 border border-rose-200">Download Image</button>
                  <button onClick={handleCopy} className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-rose-60
File}
                        className="absolute -top-6 -right-2 p-1 bg-slate-800 rounded-full border border-slate-600 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-full">
                        <p className="text-xs font-medium text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-rose-800 mb-1 block">Student Name (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Nguyen Van A"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white shadow-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all text-slate-800 placeholder:text-slate-300"
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-2 text-left border border-red-100">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); generateFeedback(); }}
              disabled={!file || isGenerating}
              className={cn(
                "mt-6 w-full py-4 px-4 rounded-2xl font-bold text-[15px] shadow-lg transition-all flex justify-center items-center gap-3 overflow-hidden",
                !file 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                  : isGenerating 
                    ? "bg-rose-500 text-white shadow-rose-200 cursor-wait"
                    : "bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white shadow-rose-300/50 hover:shadow-rose-400/50 active:scale-[0.98]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={loadingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-medium inline-block text-left relative overflow-hidden"
                    >
                      {getLoadingStates(teacherName)[loadingStep]}
                    </motion.span>
                  </AnimatePresence>
                </>
              ) : (
                "Generate Feedback ✨"
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Results Panel */}
        <div className="w-full md:w-2/3 flex flex-col gap-6 h-full min-h-[500px]">
          <AnimatePresence>
            {studentTranscript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                     <AudioLines className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-rose-950">Transcription</h3>
                </div>
                <div className="p-5 bg-rose-50/50 border border-rose-100/50 rounded-2xl text-slate-700 text-[15px] leading-relaxed font-medium italic">
                  "{studentTranscript}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {feedback ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-rose-100/40 border border-rose-100 h-full flex flex-col overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-50 to-rose-50 rounded-bl-[100px] -z-10 opacity-60"></div>
              <div className="p-6 md:p-8 border-b border-rose-50 flex justify-between items-center bg-transparent">
                <h3 className="font-extrabold text-2xl text-rose-950 flex items-center gap-3">
                  Feedback Ready! 💌
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isDownloading ? "Saving..." : "Download Image"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold",
                      copied 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 shadow-sm"
                    )}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy for Word/Docs"}
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6 overflow-auto w-full max-w-none flex-1 bg-rose-50/20">
                <div 
                  ref={markdownContainerRef} 
                  className="markdown-body bg-white rounded-xl shadow-sm border border-rose-100/50 p-6 md:p-8 min-w-[900px] mx-auto overflow-hidden"
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {feedback}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
             <div className="bg-white border-2 border-rose-100 border-dashed rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center text-rose-400 space-y-6 shadow-sm p-8 text-center bg-rose-50/30">
                <div className="w-24 h-24 rounded-[2rem] bg-rose-100/60 flex items-center justify-center mb-2 transform -rotate-12">
                   <span className="text-5xl">💌</span>
                </div>
                <div>
                  <h3 className="font-bold text-rose-900 mb-2 text-xl">Ready when you are!</h3>
                  <p className="text-[15px] max-w-sm text-rose-600/70 leading-relaxed font-medium">Upload a video or audio clip and select "Generate Feedback ✨" to create some magic for your student.</p>
                </div>
             </div>
          )}
        </div>

      </main>
    </div>
  );
}
