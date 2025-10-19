import { Layout } from '@/components/Layout';
import { useMembers } from '@/contexts/MembersContext';
import { useTasks } from '@/contexts/TasksContext';
import { useRatings } from '@/contexts/RatingsContext';
import { useCalculations } from '@/hooks/useCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Download, Star, TrendingUp, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAllMembersReport } from '@/utils/pdfExport';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { members } = useMembers();
  const { tasks } = useTasks();
  const { ratings } = useRatings();
  const { leaderboard } = useCalculations(members, tasks, ratings);

  const handleExportAll = () => {
    generateAllMembersReport(members, tasks, ratings);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="h-5 w-5 text-warning fill-warning" />;
    if (index === 1) return <Medal className="h-5 w-5 text-muted-foreground fill-muted-foreground" />;
    if (index === 2) return <Medal className="h-5 w-5 text-accent fill-accent" />;
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground">Overall team member rankings</p>
          </div>
          <Button onClick={handleExportAll} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export All Reports
          </Button>
        </div>

        {/* Top 3 Spotlight */}
        {leaderboard.length >= 3 && (
          <div className="grid gap-4 md:grid-cols-3">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <Card
                key={entry.member.id}
                className={`card-hover cursor-pointer ${
                  index === 0 ? 'gradient-primary text-primary-foreground' : 'border-primary/20'
                }`}
                onClick={() => navigate(`/members/${entry.member.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{entry.member.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {entry.member.role}
                      </Badge>
                    </div>
                    {getMedalIcon(index)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-6 w-6 text-warning fill-warning" />
                    <span className="text-3xl font-bold">
                      {entry.stats.averageRating > 0 ? entry.stats.averageRating.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs opacity-75">Tasks</div>
                      <div className="font-semibold">{entry.stats.totalTasks}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-75">Completion</div>
                      <div className="font-semibold">{entry.stats.completionRate.toFixed(0)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No rankings yet. Start adding members and rating their performance!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Avg Rating</TableHead>
                    <TableHead className="text-center">Tasks</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead className="text-center">Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow
                      key={entry.member.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/members/${entry.member.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getMedalIcon(index) || `#${index + 1}`}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.member.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.member.role}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          <span className="font-semibold">
                            {entry.stats.averageRating > 0 ? entry.stats.averageRating.toFixed(2) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{entry.stats.totalTasks}</TableCell>
                      <TableCell className="text-center">{entry.stats.completedTasks}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3 text-secondary" />
                          <span>{entry.stats.completionRate.toFixed(0)}%</span>
                        </div>
                      </TableCell>
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

export default LeaderboardPage;
