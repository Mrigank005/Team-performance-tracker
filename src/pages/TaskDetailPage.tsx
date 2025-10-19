import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useTasks } from '@/contexts/TasksContext';
import { useMembers } from '@/contexts/MembersContext';
import { useRatings } from '@/contexts/RatingsContext';
import { useCalculations } from '@/hooks/useCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Download,
  Star,
  Plus,
  CheckCircle2,
  Calendar,
  Users,
  FileText,
  StarIcon,
} from 'lucide-react';
import { generateTaskReport } from '@/utils/pdfExport';
import { TaskStatus, RatingMode, RatingDimensions } from '@/types';

const statusColors = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info-foreground',
  'review': 'bg-warning/20 text-warning-foreground',
  'completed': 'bg-secondary/20 text-secondary-foreground',
};

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, getTaskById, updateTaskStatus, addSubtask, toggleSubtask } = useTasks();
  const { members } = useMembers();
  const { ratings, addRating, getRatingsByTask } = useRatings();
  const { getTaskLeaderboard } = useCalculations(members, tasks, ratings);

  const task = getTaskById(id!);
  const taskRatings = getRatingsByTask(id!);
  const leaderboard = getTaskLeaderboard(id!);

  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [ratingMode, setRatingMode] = useState<RatingMode>('daily');
  const [ratingDimensions, setRatingDimensions] = useState<RatingDimensions>({
    quality: 3,
    timeliness: 3,
    communication: 3,
    initiative: 3,
  });
  const [ratingComments, setRatingComments] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!task) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Task not found</p>
          <Button onClick={() => navigate('/tasks')} className="mt-4">
            Back to Tasks
          </Button>
        </div>
      </Layout>
    );
  }

  const handleExport = () => {
    generateTaskReport(task, members, taskRatings);
  };

  const handleAddRating = () => {
    if (selectedMember) {
      addRating({
        taskId: task.id,
        memberId: selectedMember,
        dimensions: ratingDimensions,
        comments: ratingComments,
        mode: ratingMode,
      });
      setSelectedMember('');
      setRatingDimensions({ quality: 3, timeliness: 3, communication: 3, initiative: 3 });
      setRatingComments('');
      setIsRatingDialogOpen(false);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, { title: newSubtaskTitle, completed: false });
      setNewSubtaskTitle('');
      setIsSubtaskDialogOpen(false);
    }
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const RatingStars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value ? 'text-warning fill-warning' : 'text-muted stroke-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/tasks')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <StarIcon className="h-4 w-4" />
                  Add Rating
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Rate Member Performance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Select Member</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {task.assignedMembers.map((memberId) => {
                          const member = members.find((m) => m.id === memberId);
                          return member ? (
                            <SelectItem key={memberId} value={memberId}>
                              {member.name} - {member.role}
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rating Mode</Label>
                    <Select value={ratingMode} onValueChange={(v) => setRatingMode(v as RatingMode)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Check-in</SelectItem>
                        <SelectItem value="final">Final Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4 border-t pt-4">
                    {(Object.keys(ratingDimensions) as Array<keyof RatingDimensions>).map((dimension) => (
                      <div key={dimension} className="space-y-2">
                        <Label className="capitalize">{dimension.replace(/([A-Z])/g, ' $1')}</Label>
                        <RatingStars
                          value={ratingDimensions[dimension]}
                          onChange={(value) =>
                            setRatingDimensions({ ...ratingDimensions, [dimension]: value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Comments</Label>
                    <Textarea
                      placeholder="Additional feedback..."
                      rows={3}
                      value={ratingComments}
                      onChange={(e) => setRatingComments(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddRating} className="w-full" disabled={!selectedMember}>
                    Submit Rating
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Task Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={statusColors[task.status]}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <Select
                  value={task.status}
                  onValueChange={(value) => updateTaskStatus(task.id, value as TaskStatus)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Timeline</div>
                  <div className="text-sm font-medium">
                    {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Assigned Members</div>
                  <div className="text-sm font-medium">{task.assignedMembers.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Total Ratings</div>
                  <div className="text-sm font-medium">{taskRatings.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subtasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Subtasks ({completedSubtasks}/{task.subtasks.length})
              </CardTitle>
              <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subtask
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Subtask</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Subtask Title</Label>
                      <Input
                        placeholder="Enter subtask description..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                      />
                    </div>
                    <Button onClick={handleAddSubtask} className="w-full">
                      Add Subtask
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {task.subtasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subtasks yet. Add checklist items to track progress.
              </div>
            ) : (
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    />
                    <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                      {subtask.title}
                    </span>
                    {subtask.completed && <CheckCircle2 className="h-4 w-4 text-secondary ml-auto" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Member Performance Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No ratings yet. Start rating member performance!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Avg Rating</TableHead>
                    <TableHead className="text-center">Ratings Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow
                      key={entry.member.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/members/${entry.member.id}`)}
                    >
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{entry.member.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.member.role}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          <span className="font-semibold">
                            {entry.averageRating > 0 ? entry.averageRating.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{entry.ratingsCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TaskDetailPage;
