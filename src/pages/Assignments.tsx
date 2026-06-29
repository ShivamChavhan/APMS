import { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { Assignment, Priority, AssignmentStatus } from '../types';
import { 
  Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle, 
  Clock, CheckSquare, Square, Star, Sparkles, Filter
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';

interface AssignmentFormInput {
  title: string;
  subjectId: string;
  dueDate: string;
  priority: Priority;
  description: string;
}

export default function Assignments() {
  const { data, addAssignment, updateAssignment, deleteAssignment } = useAPMS();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignmentFormInput>();

  const openAddModal = () => {
    setEditingAssignment(null);
    reset({
      title: '',
      subjectId: data.subjects[0]?.id || '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (asg: Assignment) => {
    setEditingAssignment(asg);
    reset({
      title: asg.title,
      subjectId: asg.subjectId,
      dueDate: asg.dueDate,
      priority: asg.priority,
      description: asg.description || ''
    });
    setModalOpen(true);
  };

  const onSubmit = (formData: AssignmentFormInput) => {
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, formData);
    } else {
      addAssignment({
        ...formData,
        status: 'pending'
      });
    }
    setModalOpen(false);
  };

  const toggleStatus = (asg: Assignment) => {
    updateAssignment(asg.id, {
      status: asg.status === 'completed' ? 'pending' : 'completed'
    });
  };

  // Filter & sort assignments by due date
  const filteredAssignments = data.assignments
    .filter(a => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || a.priority === priorityFilter;
      return matchStatus && matchPriority;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Academic Tasks</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">Assignments Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Stay on top of deadlines, balance priorities, and mark completed deliverables</p>
        </div>

        <button
          id="add-assignment-btn"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/10"
        >
          <Plus size={16} />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Advanced filters toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-900">
        <div className="flex flex-wrap gap-4">
          
          {/* Status filters */}
          <div className="flex gap-1.5 bg-slate-950 p-1 border border-slate-900 rounded-xl">
            {(['pending', 'completed', 'all'] as const).map(status => (
              <button
                key={status}
                id={`filter-status-${status}`}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-slate-900 text-cyan-400 font-bold' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Priority filter select dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <select
              id="filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredAssignments.length} task deliverables
        </div>
      </div>

      {/* Assignments list column */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((asg) => {
            const sub = data.subjects.find(s => s.id === asg.subjectId);
            const isCompleted = asg.status === 'completed';
            
            return (
              <div 
                key={asg.id} 
                className={`glass-panel p-5 rounded-2xl border transition duration-200 flex items-start gap-4 justify-between ${
                  isCompleted ? 'border-slate-900/40 opacity-70 bg-slate-900/10' : 'border-slate-800 hover:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Interactive status check trigger */}
                  <button
                    id={`toggle-asg-${asg.id}`}
                    onClick={() => toggleStatus(asg)}
                    className={`mt-1 p-0.5 rounded-md hover:text-cyan-400 transition shrink-0 cursor-pointer ${
                      isCompleted ? 'text-cyan-500' : 'text-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    {isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {asg.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                        asg.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        asg.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {asg.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                      {asg.description || "No description provided."}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                      <span>Course: <strong className="text-slate-400">{sub?.name || "Deleted course"} ({sub?.code})</strong></span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Due: {new Date(asg.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(asg)}
                    className="p-1 text-slate-500 hover:text-cyan-400 transition"
                    title="Edit Assignment Detail"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteAssignment(asg.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Delete Assignment"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-500 font-mono text-xs">
            No assignments match your filters. All caught up! 🎉
          </div>
        )}
      </div>

      {/* Add / Edit Modal Component */}
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
                {editingAssignment ? 'Edit Assignment Detail' : 'Create Academic Task'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Assignment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Normalization Lab Report"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('title', { required: true })}
                  />
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subject / Course</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('subjectId', { required: true })}
                  >
                    {data.subjects.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-950">{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                {/* Due Date and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('dueDate', { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('priority', { required: true })}
                    >
                      <option value="high" className="bg-slate-950">High</option>
                      <option value="medium" className="bg-slate-950">Medium</option>
                      <option value="low" className="bg-slate-950">Low</option>
                    </select>
                  </div>
                </div>

                {/* Description details */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Task Description</label>
                  <textarea
                    rows={3}
                    placeholder="Write details, requirements, or links..."
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
                    Save Assignment
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
