import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface MembersContextType {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  getMemberById: (id: string) => Member | undefined;
  isLoading: boolean;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export const MembersProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load members from Supabase on mount
  useEffect(() => {
    fetchMembers();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert database format to app format
      const formattedMembers: Member[] = data.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        contact: member.contact,
        createdAt: new Date(member.created_at),
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error loading members',
        description: 'Failed to load members from database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase.from('members').insert({
        name: memberData.name,
        role: memberData.role,
        contact: memberData.contact,
      });

      if (error) throw error;

      // Refresh the members list immediately
      await fetchMembers();

      toast({
        title: 'Member added',
        description: `${memberData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error adding member',
        description: 'Failed to add member. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: memberData.name,
          role: memberData.role,
          contact: memberData.contact,
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh the members list immediately
      await fetchMembers();

      toast({
        title: 'Member updated',
        description: 'Member information has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error updating member',
        description: 'Failed to update member. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);

      if (error) throw error;

      // Refresh the members list immediately
      await fetchMembers();

      toast({
        title: 'Member deleted',
        description: 'Member has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error deleting member',
        description: 'Failed to delete member. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getMemberById = (id: string) => {
    return members.find((member) => member.id === id);
  };

  return (
    <MembersContext.Provider
      value={{
        members,
        addMember,
        updateMember,
        deleteMember,
        getMemberById,
        isLoading,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error('useMembers must be used within MembersProvider');
  }
  return context;
};
