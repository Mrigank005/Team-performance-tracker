import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MembersProvider } from "@/contexts/MembersContext";
import { TasksProvider } from "@/contexts/TasksContext";
import { RatingsProvider } from "@/contexts/RatingsContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import MembersPage from "./pages/MembersPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ArchivePage from "./pages/ArchivePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <MembersProvider>
        <TasksProvider>
          <RatingsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="/members/:id" element={<MemberProfilePage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/archive" element={<ArchivePage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RatingsProvider>
        </TasksProvider>
      </MembersProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
