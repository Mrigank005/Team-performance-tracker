import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useTasks } from '@/contexts/TasksContext';
import { useMembers } from '@/contexts/MembersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskStatus } from '@/types';

const statusColors: Record<TaskStatus, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info-foreground',
  'review': 'bg-warning/20 text-warning-foreground',
  'completed': 'bg-secondary/20 text-secondary-foreground',
};

const statusLabels: Record<TaskStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'review': 'In Review',
  'completed': 'Completed',
};

const TasksPage = () => {
  const navigate = useNavigate();
  const { tasks, addTask } = useTasks();
  const { members } = useMembers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    assignedMembers: [] as string[],
    status: 'not-started' as TaskStatus,
  });

  const activeTasks = tasks.filter((task) => task.status !== 'completed');

  const filteredTasks = activeTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTask = () => {
    if (newTask.title && newTask.startDate && newTask.endDate) {
      addTask({
        ...newTask,
        startDate: new Date(newTask.startDate),
        endDate: new Date(newTask.endDate),
        subtasks: [],
        attachments: [],
      });
      setNewTask({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        assignedMembers: [],
        status: 'not-started',
      });
      setIsAddDialogOpen(false);
    }
  };

  const toggleMemberAssignment = (memberId: string) => {
    setNewTask((prev) => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(memberId)
        ? prev.assignedMembers.filter((id) => id !== memberId)
        : [...prev.assignedMembers, memberId],
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Create and manage team tasks</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="Design landing page"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Task description..."
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newTask.startDate}
                      onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newTask.endDate}
                      onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign Members</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                    {members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newTask.assignedMembers.includes(member.id)}
                          onChange={() => toggleMemberAssignment(member.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'No tasks found matching your filters.'
                  : 'No active tasks yet. Create your first task to get started!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="card-hover cursor-pointer border-primary/20"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{task.title}</CardTitle>
                    <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {task.startDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {task.assignedMembers.length}
                    </div>
                    {task.subtasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                      </div>
                    )}
                  </div>
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TasksPage;
