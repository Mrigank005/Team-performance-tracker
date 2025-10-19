import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Rating, RatingDimensions, RatingMode } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface RatingsContextType {
  ratings: Rating[];
  addRating: (rating: Omit<Rating, 'id' | 'timestamp'>) => Promise<void>;
  getRatingsByTask: (taskId: string) => Rating[];
  getRatingsByMember: (memberId: string) => Rating[];
  getRatingsByTaskAndMember: (taskId: string, memberId: string) => Rating[];
  deleteRating: (id: string) => Promise<void>;
  isLoading: boolean;
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export const RatingsProvider = ({ children }: { children: ReactNode }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load ratings from Supabase on mount
  useEffect(() => {
    fetchRatings();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('ratings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ratings' },
        () => {
          fetchRatings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Convert database format to app format
      const formattedRatings: Rating[] = data.map((rating) => ({
        id: rating.id,
        taskId: rating.task_id,
        memberId: rating.member_id,
        dimensions: {
          quality: rating.quality,
          timeliness: rating.timeliness,
          communication: rating.communication,
          initiative: rating.initiative,
        },
        comments: rating.comments,
        mode: rating.mode as RatingMode,
        timestamp: new Date(rating.timestamp),
      }));

      setRatings(formattedRatings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast({
        title: 'Error loading ratings',
        description: 'Failed to load ratings from database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRating = async (ratingData: Omit<Rating, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase.from('ratings').insert({
        task_id: ratingData.taskId,
        member_id: ratingData.memberId,
        quality: ratingData.dimensions.quality,
        timeliness: ratingData.dimensions.timeliness,
        communication: ratingData.dimensions.communication,
        initiative: ratingData.dimensions.initiative,
        comments: ratingData.comments,
        mode: ratingData.mode,
      });

      if (error) throw error;

      // Refresh the ratings list immediately
      await fetchRatings();

      toast({
        title: 'Rating added',
        description: 'Performance rating has been recorded successfully.',
      });
    } catch (error) {
      console.error('Error adding rating:', error);
      toast({
        title: 'Error adding rating',
        description: 'Failed to add rating. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getRatingsByTask = (taskId: string) => {
    return ratings.filter((rating) => rating.taskId === taskId);
  };

  const getRatingsByMember = (memberId: string) => {
    return ratings.filter((rating) => rating.memberId === memberId);
  };

  const getRatingsByTaskAndMember = (taskId: string, memberId: string) => {
    return ratings.filter(
      (rating) => rating.taskId === taskId && rating.memberId === memberId
    );
  };

  const deleteRating = async (id: string) => {
    try {
      const { error } = await supabase.from('ratings').delete().eq('id', id);

      if (error) throw error;

      // Refresh the ratings list immediately
      await fetchRatings();

      toast({
        title: 'Rating deleted',
        description: 'Rating has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast({
        title: 'Error deleting rating',
        description: 'Failed to delete rating. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <RatingsContext.Provider
      value={{
        ratings,
        addRating,
        getRatingsByTask,
        getRatingsByMember,
        getRatingsByTaskAndMember,
        deleteRating,
        isLoading,
      }}
    >
      {children}
    </RatingsContext.Provider>
  );
};

export const useRatings = () => {
  const context = useContext(RatingsContext);
  if (!context) {
    throw new Error('useRatings must be used within RatingsProvider');
  }
  return context;
};
