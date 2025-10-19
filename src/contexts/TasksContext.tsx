import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, Subtask, TaskAttachment } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  addSubtask: (taskId: string, subtask: Omit<Subtask, 'id'>) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt'>) => Promise<void>;
  getTasksByMember: (memberId: string) => Task[];
  isLoading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from Supabase on mount
  useEffect(() => {
    fetchTasks();
    
    // Subscribe to real-time changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchTasks()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_assignments' },
        () => fetchTasks()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        () => fetchTasks()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_attachments' },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      // Fetch all tasks with their relationships
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch all task assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // Fetch all subtasks
      const { data: subtasksData, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*');

      if (subtasksError) throw subtasksError;

      // Fetch all attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('task_attachments')
        .select('*');

      if (attachmentsError) throw attachmentsError;

      // Combine data into Task objects
      const formattedTasks: Task[] = tasksData.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        startDate: new Date(task.start_date),
        endDate: new Date(task.end_date),
        status: task.status as TaskStatus,
        assignedMembers: assignmentsData
          .filter((a) => a.task_id === task.id)
          .map((a) => a.member_id),
        subtasks: subtasksData
          .filter((s) => s.task_id === task.id)
          .map((s) => ({
            id: s.id,
            title: s.title,
            completed: s.completed,
          })),
        attachments: attachmentsData
          .filter((a) => a.task_id === task.id)
          .map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            base64Data: a.base64_data,
            uploadedAt: new Date(a.uploaded_at),
          })),
        createdAt: new Date(task.created_at),
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error loading tasks',
        description: 'Failed to load tasks from database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      // Insert task
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          start_date: taskData.startDate.toISOString(),
          end_date: taskData.endDate.toISOString(),
          status: taskData.status,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Insert task assignments
      if (taskData.assignedMembers.length > 0) {
        const assignments = taskData.assignedMembers.map((memberId) => ({
          task_id: newTask.id,
          member_id: memberId,
        }));

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      // Insert subtasks
      if (taskData.subtasks.length > 0) {
        const subtasks = taskData.subtasks.map((subtask) => ({
          task_id: newTask.id,
          title: subtask.title,
          completed: subtask.completed,
        }));

        const { error: subtaskError } = await supabase
          .from('subtasks')
          .insert(subtasks);

        if (subtaskError) throw subtaskError;
      }

      // Refresh the tasks list immediately
      await fetchTasks();

      toast({
        title: 'Task created',
        description: `${taskData.title} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error creating task',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updates: any = {};
      if (taskData.title) updates.title = taskData.title;
      if (taskData.description) updates.description = taskData.description;
      if (taskData.startDate) updates.start_date = taskData.startDate.toISOString();
      if (taskData.endDate) updates.end_date = taskData.endDate.toISOString();
      if (taskData.status) updates.status = taskData.status;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
      }

      // Update assignments if provided
      if (taskData.assignedMembers) {
        // Delete existing assignments
        await supabase.from('task_assignments').delete().eq('task_id', id);

        // Insert new assignments
        if (taskData.assignedMembers.length > 0) {
          const assignments = taskData.assignedMembers.map((memberId) => ({
            task_id: id,
            member_id: memberId,
          }));

          const { error: assignmentError } = await supabase
            .from('task_assignments')
            .insert(assignments);

          if (assignmentError) throw assignmentError;
        }
      }

      // Refresh the tasks list immediately
      await fetchTasks();

      toast({
        title: 'Task updated',
        description: 'Task has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error updating task',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      // Refresh the tasks list immediately
      await fetchTasks();

      toast({
        title: 'Task deleted',
        description: 'Task has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error deleting task',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id);
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const addSubtask = async (taskId: string, subtaskData: Omit<Subtask, 'id'>) => {
    try {
      const { error } = await supabase.from('subtasks').insert({
        task_id: taskId,
        title: subtaskData.title,
        completed: subtaskData.completed,
      });

      if (error) throw error;

      // Refresh the tasks list immediately
      await fetchTasks();

      toast({
        title: 'Subtask added',
        description: 'Subtask has been added successfully.',
      });
    } catch (error) {
      console.error('Error adding subtask:', error);
      toast({
        title: 'Error adding subtask',
        description: 'Failed to add subtask. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const task = getTaskById(taskId);
      if (!task) return;

      const subtask = task.subtasks.find((s) => s.id === subtaskId);
      if (!subtask) return;

      const { error } = await supabase
        .from('subtasks')
        .update({ completed: !subtask.completed })
        .eq('id', subtaskId);

      if (error) throw error;

      // Refresh the tasks list immediately
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling subtask:', error);
      toast({
        title: 'Error updating subtask',
        description: 'Failed to update subtask. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addAttachment = async (
    taskId: string,
    attachmentData: Omit<TaskAttachment, 'id' | 'uploadedAt'>
  ) => {
    try {
      const { error } = await supabase.from('task_attachments').insert({
        task_id: taskId,
        name: attachmentData.name,
        type: attachmentData.type,
        base64_data: attachmentData.base64Data,
      });

      if (error) throw error;

      // Refresh the tasks list immediately
      await fetchTasks();

      toast({
        title: 'Attachment added',
        description: 'File has been attached successfully.',
      });
    } catch (error) {
      console.error('Error adding attachment:', error);
      toast({
        title: 'Error adding attachment',
        description: 'Failed to add attachment. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getTasksByMember = (memberId: string) => {
    return tasks.filter((task) => task.assignedMembers.includes(memberId));
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        updateTaskStatus,
        addSubtask,
        toggleSubtask,
        addAttachment,
        getTasksByMember,
        isLoading,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
};
