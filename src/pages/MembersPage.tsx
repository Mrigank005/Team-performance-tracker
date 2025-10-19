import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useMembers } from '@/contexts/MembersContext';
import { useTasks } from '@/contexts/TasksContext';
import { useRatings } from '@/contexts/RatingsContext';
import { useCalculations } from '@/hooks/useCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Search, Star, TrendingUp, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembersPage = () => {
  const navigate = useNavigate();
  const { members, addMember, deleteMember } = useMembers();
  const { tasks } = useTasks();
  const { ratings } = useRatings();
  const { getMemberStats } = useCalculations(members, tasks, ratings);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', contact: '' });

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    if (newMember.name && newMember.role && newMember.contact) {
      addMember(newMember);
      setNewMember({ name: '', role: '', contact: '' });
      setIsAddDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">Manage your team and view their performance</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role/Domain</Label>
                  <Input
                    id="role"
                    placeholder="Frontend Developer"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    placeholder="email@example.com"
                    value={newMember.contact}
                    onChange={(e) => setNewMember({ ...newMember, contact: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddMember} className="w-full">
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or role..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No members found matching your search.' : 'No members yet. Add your first team member to get started!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => {
              const stats = getMemberStats(member.id);
              return (
                <Card
                  key={member.id}
                  className="card-hover cursor-pointer border-primary/20"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {member.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${member.name}?`)) {
                            deleteMember(member.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">{member.contact}</div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground">Tasks</div>
                        <div className="text-lg font-semibold">{stats.totalTasks}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                        <div className="text-lg font-semibold">{stats.completedTasks}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span className="font-semibold">
                          {stats.averageRating > 0 ? stats.averageRating.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {stats.completionRate.toFixed(0)}%
                      </div>
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

export default MembersPage;
