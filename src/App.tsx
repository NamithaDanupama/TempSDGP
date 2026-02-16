import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import LessonPlaneHome from "./pages/LessonPlaneHome";
import CreateLesson from "./pages/CreateLesson";
import EditLesson from "./pages/EditLesson";
import PlayLesson from "./pages/PlayLesson";
import ReinforcedLearning from "./pages/ReinforcedLearning";
import TeacherDashboard from "./pages/TeacherDashboard";
import ActivitiesPage from "./pages/ActivitiesPage";
import SpeechReportsPage from "./pages/SpeechReportsPage";
import RemindersPage from "./pages/RemindersPage";
import CalendarPage from "./pages/CalendarPage";
import VisualSearch from "./pages/VisualSearch";
import HealthData from "./pages/HealthData";
import SchedulePage from "./pages/SchedulePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/LessonPlaneHome" element={<LessonPlaneHome />} />
          <Route path="/CreateLesson" element={<CreateLesson />} />
          <Route path="/EditLesson/:id" element={<EditLesson />} />
          <Route path="/PlayLesson/:id" element={<PlayLesson />} />
          <Route path="/reinforced-learning" element={<ReinforcedLearning />} />
          <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/speech-reports" element={<SpeechReportsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/visual-search" element={<VisualSearch/>} />
          <Route path="/health-data" element={<HealthData />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
