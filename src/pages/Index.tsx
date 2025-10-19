import { Layout } from '@/components/Layout';
import { useMembers } from '@/contexts/MembersContext';
import { useTasks } from '@/contexts/TasksContext';
import { useRatings } from '@/contexts/RatingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ListTodo, CheckCircle, TrendingUp } from 'lucide-react';
import { LoadingPage } from '@/components/ui/loading-spinner';

const Index = () => {
  const { members, isLoading: membersLoading } = useMembers();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { ratings, isLoading: ratingsLoading } = useRatings();

  // Show loading state while any context is still loading
  const isLoading = membersLoading || tasksLoading || ratingsLoading;

  if (isLoading) {
    return <LoadingPage text="Loading Performance Tracker..." />;
  }

  const activeTasks = tasks.filter((task) => task.status !== 'completed').length;
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const stats = [
    {
      title: 'Total Members',
      value: members.length,
      icon: Users,
      gradient: 'gradient-primary',
    },
    {
      title: 'Active Tasks',
      value: activeTasks,
      icon: ListTodo,
      gradient: 'gradient-secondary',
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle,
      gradient: 'gradient-accent',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'gradient-primary',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-xl bg-gradient-primary p-8 text-primary-foreground shadow-lg">
          <h2 className="mb-2 text-3xl font-bold">Welcome to Performance Tracker</h2>
          <p className="text-lg opacity-90">
            Monitor and evaluate team member performance across all tasks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="card-hover border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length === 0 && tasks.length === 0 && members.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No activity yet. Get started by:</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Adding team members</li>
                  <li>• Creating tasks</li>
                  <li>• Recording performance ratings</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                {ratings.slice(-5).reverse().map((rating) => {
                  const member = members.find((m) => m.id === rating.memberId);
                  const task = tasks.find((t) => t.id === rating.taskId);
                  const avgRating = (
                    rating.dimensions.quality +
                    rating.dimensions.timeliness +
                    rating.dimensions.communication +
                    rating.dimensions.initiative
                  ) / 4;

                  return (
                    <div
                      key={rating.id}
                      className="flex items-center justify-between rounded-lg border border-primary/10 bg-card/50 p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {member?.name || 'Unknown'} rated on {task?.title || 'Unknown Task'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rating.timestamp.toLocaleDateString()} •{' '}
                          {rating.mode === 'daily' ? 'Daily Check-in' : 'Final Review'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">/5.0</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
