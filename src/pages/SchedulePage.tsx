import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ArrowLeft, X, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SchedulePage = () => {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<any>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load/Save Events
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('mochi_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mochi_events', JSON.stringify(events));
  }, [events]);

  // Handle clicking an empty slot
  const handleDateSelect = (selectInfo: any) => {
    setSelectedInfo(selectInfo);
    setEventTitle("");
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Handle clicking an existing event
  const handleEventClick = (clickInfo: any) => {
    setSelectedInfo(clickInfo);
    setEventTitle(clickInfo.event.title);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;

    if (isEditing) {
      // Update existing
      setEvents(prev => prev.map(e => 
        e.id === selectedInfo.event.id ? { ...e, title: eventTitle } : e
      ));
    } else {
      // Create new
      const newEvent = {
        id: String(Date.now()),
        title: eventTitle,
        start: selectedInfo.startStr,
        end: selectedInfo.endStr,
        allDay: selectedInfo.allDay,
        backgroundColor: 'hsl(var(--success))',
        borderColor: 'hsl(var(--success))',
        textColor: 'hsl(var(--success-foreground))'
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = () => {
    setEvents(prev => prev.filter(e => e.id !== selectedInfo.event.id));
    selectedInfo.event.remove();
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-nunito p-4 md:p-8">
      <header className="flex items-center justify-between mb-8 px-6 py-4 bg-card rounded-3xl shadow-soft border border-border/40 animate-slide-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Schedule Manager</h1>
        </div>
        <Button className="rounded-full bg-primary px-6" onClick={() => calendarRef.current?.getApi().today()}>
          Today
        </Button>
      </header>

      <div className="bg-card p-6 rounded-[2.5rem] shadow-soft border border-border/40 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          editable={true}
          selectable={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          themeSystem="standard"
        />
      </div>

      {/* --- Custom Event Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden animate-scale-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {isEditing ? "Edit Event" : "New Event"} 
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Event Title</label>
                  <input 
                    autoFocus
                    className="w-full mt-1 bg-secondary/50 border-none rounded-2xl px-4 py-3 focus:ring-2 ring-primary/50 transition-all font-semibold"
                    placeholder="e.g., Mathematics Activity"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{isEditing ? selectedInfo.event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Selected Time Slot"}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {isEditing && (
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-2xl text-destructive hover:bg-destructive/10"
                    onClick={handleDeleteEvent}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button 
                  className="flex-[2] rounded-2xl bg-primary shadow-lg shadow-primary/20"
                  onClick={handleSaveEvent}
                >
                  {isEditing ? "Save Changes" : "Create "}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;