import { useMemo } from 'react';
import { Member, Task, Rating, MemberStats } from '@/types';

export const useCalculations = (
  members: Member[],
  tasks: Task[],
  ratings: Rating[]
) => {
  // Calculate average rating from dimensions
  const calculateAverageRating = (rating: Rating): number => {
    const { quality, timeliness, communication, initiative } = rating.dimensions;
    return (quality + timeliness + communication + initiative) / 4;
  };

  // Calculate member statistics
  const getMemberStats = useMemo(() => {
    return (memberId: string): MemberStats => {
      const memberTasks = tasks.filter((task) =>
        task.assignedMembers.includes(memberId)
      );
      const memberRatings = ratings.filter((rating) => rating.memberId === memberId);
      const completedTasks = memberTasks.filter((task) => task.status === 'completed');

      // Calculate average rating
      const totalRating = memberRatings.reduce(
        (sum, rating) => sum + calculateAverageRating(rating),
        0
      );
      const averageRating = memberRatings.length > 0 ? totalRating / memberRatings.length : 0;

      // Calculate completion rate
      const completionRate =
        memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 0;

      // Calculate rating trend (grouped by date)
      const ratingsByDate = new Map<string, number[]>();
      memberRatings.forEach((rating) => {
        const dateKey = rating.timestamp.toISOString().split('T')[0];
        if (!ratingsByDate.has(dateKey)) {
          ratingsByDate.set(dateKey, []);
        }
        ratingsByDate.get(dateKey)!.push(calculateAverageRating(rating));
      });

      const ratingTrend = Array.from(ratingsByDate.entries()).map(([date, ratings]) => ({
        date: new Date(date),
        rating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      }));

      ratingTrend.sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        totalTasks: memberTasks.length,
        completedTasks: completedTasks.length,
        averageRating,
        completionRate,
        ratingTrend,
      };
    };
  }, [tasks, ratings]);

  // Calculate overall leaderboard
  const leaderboard = useMemo(() => {
    return members
      .map((member) => {
        const stats = getMemberStats(member.id);
        return {
          member,
          stats,
        };
      })
      .sort((a, b) => b.stats.averageRating - a.stats.averageRating);
  }, [members, getMemberStats]);

  // Calculate task-specific leaderboard
  const getTaskLeaderboard = useMemo(() => {
    return (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return [];

      return task.assignedMembers
        .map((memberId) => {
          const member = members.find((m) => m.id === memberId);
          if (!member) return null;

          const taskRatings = ratings.filter(
            (r) => r.taskId === taskId && r.memberId === memberId
          );

          const totalRating = taskRatings.reduce(
            (sum, rating) => sum + calculateAverageRating(rating),
            0
          );
          const averageRating = taskRatings.length > 0 ? totalRating / taskRatings.length : 0;

          return {
            member,
            averageRating,
            ratingsCount: taskRatings.length,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.averageRating - a.averageRating);
    };
  }, [members, tasks, ratings]);

  // Calculate dimension-wise averages for a member
  const getMemberDimensionAverages = useMemo(() => {
    return (memberId: string) => {
      const memberRatings = ratings.filter((rating) => rating.memberId === memberId);
      
      if (memberRatings.length === 0) {
        return {
          quality: 0,
          timeliness: 0,
          communication: 0,
          initiative: 0,
        };
      }

      const totals = memberRatings.reduce(
        (acc, rating) => ({
          quality: acc.quality + rating.dimensions.quality,
          timeliness: acc.timeliness + rating.dimensions.timeliness,
          communication: acc.communication + rating.dimensions.communication,
          initiative: acc.initiative + rating.dimensions.initiative,
        }),
        { quality: 0, timeliness: 0, communication: 0, initiative: 0 }
      );

      return {
        quality: totals.quality / memberRatings.length,
        timeliness: totals.timeliness / memberRatings.length,
        communication: totals.communication / memberRatings.length,
        initiative: totals.initiative / memberRatings.length,
      };
    };
  }, [ratings]);

  return {
    getMemberStats,
    leaderboard,
    getTaskLeaderboard,
    getMemberDimensionAverages,
    calculateAverageRating,
  };
};
