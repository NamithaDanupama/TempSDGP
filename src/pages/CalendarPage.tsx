import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"; // Added Chevron icons for month nav
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "lesson" | "activity" | "meeting" | "holiday";
}

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // --- FIXED: Added missing states for the Add Event Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('mochi_events');
    return saved ? JSON.parse(saved) : [
      { id: "1", title: "Hesandu's Birthday", date: "2025-11-15", time: "All Day", type: "holiday" },
      { id: "2", title: "Cultural Day", date: "2025-11-17", time: "9:00 AM", type: "activity" },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mochi_events', JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const dateHasEvent = (date: Date) => {
    return events.some(e => isSameDay(new Date(e.date), date));
  };

  // --- FIXED: Corrected handleSaveEvent with proper state handling ---
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      title: eventTitle,
      date: selectedDate.toISOString().split('T')[0],
      time: "All Day",
      // Marks as holiday for the Dashboard Birthday logic if "birthday" is in title
      type: eventTitle.toLowerCase().includes("birthday") ? "holiday" : "lesson",
    };

    setEvents(prev => [...prev, newEvent]);
    setEventTitle(""); // Clear input
    setIsModalOpen(false); // Close modal
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="min-h-screen bg-[#F4F9FF] font-nunito p-6 md:p-10 relative">
      <header className="flex items-center gap-4 mb-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1C1E]">Calendar & Events</h1>
          <p className="text-[#64748B] font-medium">Create and manage your lessons using Mochi AI</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <Card className="lg:col-span-7 p-8 rounded-[2.5rem] shadow-sm border-none bg-white">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-xl font-bold text-[#475569]">
              {currentDate.toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
               <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                 <ChevronLeft className="w-5 h-5" />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                 <ChevronRight className="w-5 h-5" />
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-bold text-[#94A3B8] py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {days.map((date, index) => {
              const hasEvent = date && dateHasEvent(date);
              const isSelected = date && isSameDay(date, selectedDate);
              return (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  className={cn(
                    "aspect-square rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-200",
                    !date && "invisible",
                    date && !hasEvent && "text-[#475569] bg-[#F8FAFC] hover:bg-[#F1F5F9]",
                    hasEvent && "bg-[#FEE2E2] text-[#EF4444]",
                    isSelected && "ring-4 ring-primary/20 scale-105"
                  )}
                >
                  {date?.getDate()}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-bold text-[#475569] px-2">Upcoming Events</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0]">
                <h4 className="text-lg font-bold text-[#1E293B]">{event.title}</h4>
                <p className="text-[#64748B] font-medium">
                  {new Date(event.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
            <div className="h-20 border-2 border-dashed border-[#E2E8F0] rounded-3xl" />
          </div>
        </div>
      </div>

      {/* FIXED: Floating button now opens the modal properly */}
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-2xl bg-[#7DD3FC] hover:bg-[#38BDF8] shadow-lg shadow-sky-200 flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="w-8 h-8 text-white" strokeWidth={3} />
      </Button>

      {/* --- ADDED: Simple Event Modal to fix the 'undefined' errors --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 rounded-[2rem] shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Event</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X /></Button>
            </div>
            <input 
              className="w-full p-4 bg-secondary/30 rounded-2xl mb-6 outline-none focus:ring-2 ring-primary"
              placeholder="Event Title (e.g. Sara's Birthday)"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
            <Button className="w-full rounded-2xl py-6 bg-primary font-bold" onClick={handleSaveEvent}>
              Save Event
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;