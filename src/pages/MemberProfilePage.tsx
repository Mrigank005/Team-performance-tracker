import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useMembers } from '@/contexts/MembersContext';
import { useTasks } from '@/contexts/TasksContext';
import { useRatings } from '@/contexts/RatingsContext';
import { useCalculations } from '@/hooks/useCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Star, TrendingUp, Calendar, Mail } from 'lucide-react';
import { generateMemberReport } from '@/utils/pdfExport';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info-foreground',
  'review': 'bg-warning/20 text-warning-foreground',
  'completed': 'bg-secondary/20 text-secondary-foreground',
};

const MemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, getMemberById } = useMembers();
  const { tasks, getTasksByMember } = useTasks();
  const { ratings, getRatingsByMember } = useRatings();
  const { getMemberStats, getMemberDimensionAverages } = useCalculations(members, tasks, ratings);

  const member = getMemberById(id!);
  const memberTasks = getTasksByMember(id!);
  const memberRatings = getRatingsByMember(id!);
  const stats = getMemberStats(id!);
  const dimensionAverages = getMemberDimensionAverages(id!);

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Member not found</p>
          <Button onClick={() => navigate('/members')} className="mt-4">
            Back to Members
          </Button>
        </div>
      </Layout>
    );
  }

  const handleExport = () => {
    generateMemberReport(member, memberTasks, memberRatings, stats);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/members')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
                <div className="flex flex-wrap gap-3 text-sm opacity-90">
                  <Badge variant="secondary">{member.role}</Badge>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {member.contact}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {member.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.completedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-warning fill-warning" />
                <span className="text-3xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(2) : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-secondary" />
                <span className="text-3xl font-bold">{stats.completionRate.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Trend */}
        {stats.ratingTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rating Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [value.toFixed(2), 'Rating']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Dimension Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Dimension</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(dimensionAverages).map(([dimension, value]) => (
                <div key={dimension} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{dimension.replace('_', ' ')}</span>
                    <span className="font-semibold">{value > 0 ? value.toFixed(2) : 'N/A'}/5.0</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task History */}
        <Card>
          <CardHeader>
            <CardTitle>Task History</CardTitle>
          </CardHeader>
          <CardContent>
            {memberTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks assigned yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-center">Ratings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberTasks.map((task) => {
                    const taskRatings = memberRatings.filter((r) => r.taskId === task.id);
                    const avgRating =
                      taskRatings.length > 0
                        ? taskRatings.reduce((sum, r) => {
                            const avg =
                              (r.dimensions.quality +
                                r.dimensions.timeliness +
                                r.dimensions.communication +
                                r.dimensions.initiative) /
                              4;
                            return sum + avg;
                          }, 0) / taskRatings.length
                        : 0;

                    return (
                      <TableRow
                        key={task.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[task.status]}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {avgRating > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 text-warning fill-warning" />
                              <span className="font-semibold">{avgRating.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not rated</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MemberProfilePage;
