import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useTasks } from '@/contexts/TasksContext';
import { useMembers } from '@/contexts/MembersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Archive, Search, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArchivePage = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { members } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');

  const completedTasks = tasks.filter((task) => task.status === 'completed');

  const filteredTasks = completedTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Archive className="h-8 w-8 text-secondary" />
              Archive
            </h1>
            <p className="text-muted-foreground">View completed tasks and their history</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archived tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Completed Tasks */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No completed tasks found matching your search.'
                  : 'No completed tasks yet. Complete some tasks to see them here!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTasks.map((task) => {
              const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
              const allSubtasksCompleted = task.subtasks.length > 0 && completedSubtasks === task.subtasks.length;

              return (
                <Card
                  key={task.id}
                  className="card-hover cursor-pointer border-secondary/30 bg-secondary/5"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg flex-1">{task.title}</CardTitle>
                      <Badge className="bg-secondary/20 text-secondary-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.assignedMembers.length}
                      </div>
                    </div>

                    {task.subtasks.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subtasks Progress</span>
                          <div className="flex items-center gap-1">
                            {allSubtasksCompleted && (
                              <CheckCircle2 className="h-3 w-3 text-secondary" />
                            )}
                            <span className="font-medium">
                              {completedSubtasks}/{task.subtasks.length}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary transition-all duration-300"
                            style={{
                              width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 pt-2">
                      {task.assignedMembers.slice(0, 3).map((memberId) => {
                        const member = members.find((m) => m.id === memberId);
                        return member ? (
                          <Badge key={memberId} variant="outline" className="text-xs">
                            {member.name}
                          </Badge>
                        ) : null;
                      })}
                      {task.assignedMembers.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{task.assignedMembers.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArchivePage;
