import React, { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { TimetableSlot } from '../types';
import { 
  Clock, MapPin, User, CheckCircle
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export default function Timetable() {
  const { data } = useAPMS();
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Filter slots for selected day, sort by starting time
  const daySlots = data.timetable
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Calendar Scheduling</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">Weekly Timetable</h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">Organise lectures, laboratories, seminar rooms, and instructor sessions</p>
        </div>
      </div>

      {/* Weekday navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {DAYS.map((day) => (
          <button
            key={day}
            id={`tab-btn-${day.toLowerCase()}`}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition cursor-pointer border ${
              selectedDay === day 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-950 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Slots List Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {daySlots.length > 0 ? (
          daySlots.map((slot) => {
            const sub = data.subjects.find(s => s.id === slot.subjectId);
            return (
              <div key={slot.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-800 flex items-start justify-between gap-4 transition group relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                      {sub?.code || slot.subjectCode || "COURSE"}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock size={12} />
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{sub?.name || slot.subjectName || "Subject Session"}</h3>
                  
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-500" />
                      {slot.facultyName || sub?.facultyName || "To Be Assigned"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-500" />
                      Room {slot.room || "TBA"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 text-center py-16 bg-slate-900/15 border border-slate-800/40 rounded-2xl">
            <CheckCircle size={36} className="text-emerald-500/60 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">No Scheduled Lectures Today</h4>
            <p className="text-xs text-slate-500 mt-1">Enjoy your study break or refer to calendar activities!</p>
          </div>
        )}
      </div>

    </div>
  );
}
