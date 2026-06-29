import React, { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { AcademicEvent, EventType } from '../types';
import { 
  Plus, Edit2, Trash2, Calendar, Upload, FileText, 
  Sparkles, AlertCircle, CheckCircle, RefreshCw, Info, HelpCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';

interface EventFormInput {
  title: string;
  date: string;
  type: EventType;
  description: string;
}

export default function AcademicCalendar() {
  const { data, addEvent, updateEvent, deleteEvent, bulkImportAAP } = useAPMS();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);

  // File uploading states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormInput>();

  const openAddModal = () => {
    setEditingEvent(null);
    reset({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'academic',
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (ev: AcademicEvent) => {
    setEditingEvent(ev);
    reset({
      title: ev.title,
      date: ev.date,
      type: ev.type,
      description: ev.description || ''
    });
    setModalOpen(true);
  };

  const onSubmit = (formData: EventFormInput) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
    setModalOpen(false);
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = (reader.result as string).split(',')[1];
        resolve(base64Str);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle PDF Upload API Request
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only standard PDF documents are supported for AAP plan analysis.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      console.log(`Uploading file: ${file.name}`);
      const base64Data = await fileToBase64(file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pdfData: base64Data,
          fileName: file.name
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to parse the uploaded PDF plan.');
      }

      console.log("Successfully extracted AAP details:", resData.data);
      bulkImportAAP(resData.data);
      
      let msg = `Successfully analyzed ${file.name}! `;
      if (resData.simulated) {
        msg += "Configured fallback extractor completed (Extracted subjects, exam schedules and key academic milestones).";
      } else {
        msg += "Gemini 3.5 AI extracted subjects, exam schedules, and holiday dates seamlessly.";
      }
      setUploadSuccess(msg);

    } catch (err: any) {
      console.error("PDF upload handler error:", err);
      setUploadError(err.message || 'Error occurred communicating with Gemini parsing server.');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Sort events chronologically
  const calendarEvents = [...data.events]
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Syllabus & Calendars</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">AAP PDF Extract & Calendar</h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">Upload your Academic Administration Plan (AAP) to auto-populate courses and dates</p>
        </div>

        <button
          id="add-event-btn"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/10"
        >
          <Plus size={16} />
          <span>Add Academic Event</span>
        </button>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: PDF Plan uploader & Instructions */}
        <div className="space-y-6">
          
          {/* Visual PDF File Uploader Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">AAP Intelligent Extractor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your official University Academic Syllabus or Administration Plan PDF file. Our Gemini API automatically maps courses, midterm exams, and national holiday schedules.
            </p>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3 relative overflow-hidden select-none ${
                dragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <input 
                id="aap-pdf-input"
                type="file" 
                accept="application/pdf"
                onChange={handleFileInputChange}
                className="hidden" 
              />
              
              {uploading ? (
                <div className="space-y-3 py-4">
                  <RefreshCw className="mx-auto text-cyan-400 animate-spin" size={32} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">AI Gemini Extraction in Progress...</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">Analyzing curriculum layout, mapping modules & dates</span>
                  </div>
                </div>
              ) : (
                <label htmlFor="aap-pdf-input" className="cursor-pointer space-y-3 py-2 flex flex-col items-center">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Drag & Drop Syllabus PDF here</span>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">or click to browse local documents</span>
                  </div>
                </label>
              )}
            </div>

            {/* Upload status messages */}
            {uploadError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 flex items-start gap-2.5 leading-normal">
                <CheckCircle size={14} className="shrink-0 mt-0.5" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          {/* Quick instructions panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info size={14} className="text-cyan-400" />
              <span>How it operates</span>
            </h4>
            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              <p>1. The document is transmitted securely to our cloud gateway.</p>
              <p>2. Gemini parsing isolates course modules, faculty tags, midterm exam timetables, and academic milestones.</p>
              <p>3. Your local attendance board is updated instantly without overriding your attendance history.</p>
            </div>
          </div>

        </div>

        {/* Right column: Interactive Academic Events schedule list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Academic Schedule</h3>
            <span className="text-xs text-slate-500 font-mono">{calendarEvents.length} events logged</span>
          </div>

          <div className="space-y-3">
            {calendarEvents.length > 0 ? (
              calendarEvents.map((ev) => (
                <div key={ev.id} className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-800 transition">
                  <div className="flex gap-4">
                    {/* Event Type specific calendar icon indicator */}
                    <div className={`p-2.5 rounded-xl shrink-0 border ${
                      ev.type === 'holiday' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      ev.type === 'exam' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      ev.type === 'practical' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      <Calendar size={18} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{ev.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(ev.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal mt-1 font-sans">{ev.description || "No description specified."}</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(ev)}
                      className="p-1 text-slate-500 hover:text-cyan-400 transition"
                      title="Edit Event"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Event"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-500 font-mono text-xs">
                No academic calendar events logged. Add custom events or upload an AAP PDF above!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-100 mb-4 font-display">
                {editingEvent ? 'Edit Calendar Event' : 'Create Calendar Event'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter Semester Break"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('title', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('date', { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('type', { required: true })}
                    >
                      <option value="holiday" className="bg-slate-950">University Holiday</option>
                      <option value="exam" className="bg-slate-950">Theoretical Exam</option>
                      <option value="practical" className="bg-slate-950">Practical / Viva voce</option>
                      <option value="event" className="bg-slate-950">Campus Event / Festival</option>
                      <option value="academic" className="bg-slate-950">Academic Milestone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Event Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe event schedule, requirements, or permissions..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none resize-none"
                    {...register('description')}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
