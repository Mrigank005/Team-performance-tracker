import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Member, Task, Rating, MemberStats } from '@/types';

// Helper function to calculate average rating
const calculateAverageRating = (ratings: Rating[]): number => {
  if (ratings.length === 0) return 0;
  
  const total = ratings.reduce((sum, rating) => {
    const avg = (
      rating.dimensions.quality +
      rating.dimensions.timeliness +
      rating.dimensions.communication +
      rating.dimensions.initiative
    ) / 4;
    return sum + avg;
  }, 0);
  
  return total / ratings.length;
};

// Helper function to calculate dimension-wise averages
const calculateDimensionAverages = (ratings: Rating[]) => {
  if (ratings.length === 0) {
    return { quality: 0, timeliness: 0, communication: 0, initiative: 0 };
  }

  const totals = ratings.reduce(
    (acc, rating) => ({
      quality: acc.quality + rating.dimensions.quality,
      timeliness: acc.timeliness + rating.dimensions.timeliness,
      communication: acc.communication + rating.dimensions.communication,
      initiative: acc.initiative + rating.dimensions.initiative,
    }),
    { quality: 0, timeliness: 0, communication: 0, initiative: 0 }
  );

  return {
    quality: totals.quality / ratings.length,
    timeliness: totals.timeliness / ratings.length,
    communication: totals.communication / ratings.length,
    initiative: totals.initiative / ratings.length,
  };
};

export const generateMemberReport = (
  member: Member,
  tasks: Task[],
  ratings: Rating[],
  stats: MemberStats
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFillColor(180, 150, 220); // Lavender
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Member Performance Report', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Member Info
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(member.name, 20, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Role: ${member.role}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Contact: ${member.contact}`, 20, yPosition);
  yPosition += 15;

  // Summary Stats
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Summary Statistics', 20, yPosition);
  yPosition += 10;

  const summaryData = [
    ['Total Tasks Assigned', stats.totalTasks.toString()],
    ['Completed Tasks', stats.completedTasks.toString()],
    ['Completion Rate', `${stats.completionRate.toFixed(1)}%`],
    ['Average Rating', `${stats.averageRating.toFixed(2)}/5.0`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [180, 150, 220] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Dimension-wise Performance
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Dimension-wise Performance', 20, yPosition);
  yPosition += 10;

  const dimensionAvgs = calculateDimensionAverages(ratings);
  const dimensionData = [
    ['Quality of Work', `${dimensionAvgs.quality.toFixed(2)}/5.0`],
    ['Timeliness', `${dimensionAvgs.timeliness.toFixed(2)}/5.0`],
    ['Communication/Collaboration', `${dimensionAvgs.communication.toFixed(2)}/5.0`],
    ['Initiative', `${dimensionAvgs.initiative.toFixed(2)}/5.0`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Dimension', 'Average Rating']],
    body: dimensionData,
    theme: 'grid',
    headStyles: { fillColor: [150, 200, 180] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Task Breakdown
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Task Breakdown', 20, yPosition);
  yPosition += 10;

  const taskData = tasks.map((task) => {
    const taskRatings = ratings.filter((r) => r.taskId === task.id);
    const avgRating = calculateAverageRating(taskRatings);
    return [
      task.title,
      task.status.replace('-', ' ').toUpperCase(),
      avgRating > 0 ? `${avgRating.toFixed(2)}/5.0` : 'Not Rated',
      taskRatings.length.toString(),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Task', 'Status', 'Avg Rating', 'Ratings Count']],
    body: taskData,
    theme: 'striped',
    headStyles: { fillColor: [255, 180, 150] },
  });

  // Save PDF
  doc.save(`${member.name.replace(/\s+/g, '_')}_Performance_Report.pdf`);
};

export const generateTaskReport = (
  task: Task,
  members: Member[],
  ratings: Rating[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFillColor(180, 150, 220);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Task Performance Report', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Task Info
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(task.title, 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Status: ${task.status.replace('-', ' ').toUpperCase()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Timeline: ${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Assigned Members: ${task.assignedMembers.length}`, 20, yPosition);
  yPosition += 10;

  // Description
  if (task.description) {
    doc.setFont(undefined, 'bold');
    doc.text('Description:', 20, yPosition);
    yPosition += 6;
    doc.setFont(undefined, 'normal');
    const splitDesc = doc.splitTextToSize(task.description, pageWidth - 40);
    doc.text(splitDesc, 20, yPosition);
    yPosition += splitDesc.length * 6 + 10;
  }

  // Task Statistics
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Task Statistics', 20, yPosition);
  yPosition += 10;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const statsData = [
    ['Total Subtasks', task.subtasks.length.toString()],
    ['Completed Subtasks', completedSubtasks.toString()],
    ['Completion Rate', `${task.subtasks.length > 0 ? ((completedSubtasks / task.subtasks.length) * 100).toFixed(1) : 0}%`],
    ['Total Ratings', ratings.length.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [150, 200, 180] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Member Performance Leaderboard
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Member Performance Leaderboard', 20, yPosition);
  yPosition += 10;

  const memberPerformance = task.assignedMembers.map((memberId) => {
    const member = members.find((m) => m.id === memberId);
    const memberRatings = ratings.filter((r) => r.memberId === memberId);
    const avgRating = calculateAverageRating(memberRatings);
    const dimAvgs = calculateDimensionAverages(memberRatings);

    return [
      member?.name || 'Unknown',
      avgRating > 0 ? avgRating.toFixed(2) : 'N/A',
      dimAvgs.quality > 0 ? dimAvgs.quality.toFixed(2) : 'N/A',
      dimAvgs.timeliness > 0 ? dimAvgs.timeliness.toFixed(2) : 'N/A',
      memberRatings.length.toString(),
    ];
  });

  // Sort by average rating (descending)
  memberPerformance.sort((a, b) => {
    const aRating = a[1] === 'N/A' ? 0 : parseFloat(a[1]);
    const bRating = b[1] === 'N/A' ? 0 : parseFloat(b[1]);
    return bRating - aRating;
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Member', 'Avg Rating', 'Quality', 'Timeliness', 'Ratings']],
    body: memberPerformance,
    theme: 'striped',
    headStyles: { fillColor: [255, 180, 150] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Subtask Checklist
  if (task.subtasks.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Subtask Checklist', 20, yPosition);
    yPosition += 10;

    const subtaskData = task.subtasks.map((subtask) => [
      subtask.title,
      subtask.completed ? '✓ Completed' : '○ Pending',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Subtask', 'Status']],
      body: subtaskData,
      theme: 'grid',
      headStyles: { fillColor: [180, 150, 220] },
    });
  }

  // Save PDF
  doc.save(`${task.title.replace(/\s+/g, '_')}_Task_Report.pdf`);
};

export const generateAllMembersReport = (
  members: Member[],
  tasks: Task[],
  ratings: Rating[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFillColor(180, 150, 220);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Overall Team Performance Report', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Overall Leaderboard
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Team Leaderboard', 20, yPosition);
  yPosition += 10;

  const leaderboardData = members.map((member) => {
    const memberRatings = ratings.filter((r) => r.memberId === member.id);
    const memberTasks = tasks.filter((t) => t.assignedMembers.includes(member.id));
    const completedTasks = memberTasks.filter((t) => t.status === 'completed').length;
    const avgRating = calculateAverageRating(memberRatings);

    return [
      member.name,
      member.role,
      memberTasks.length.toString(),
      completedTasks.toString(),
      avgRating > 0 ? avgRating.toFixed(2) : 'N/A',
      memberRatings.length.toString(),
    ];
  });

  // Sort by average rating
  leaderboardData.sort((a, b) => {
    const aRating = a[4] === 'N/A' ? 0 : parseFloat(a[4]);
    const bRating = b[4] === 'N/A' ? 0 : parseFloat(b[4]);
    return bRating - aRating;
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Member', 'Role', 'Tasks', 'Completed', 'Avg Rating', 'Ratings']],
    body: leaderboardData,
    theme: 'striped',
    headStyles: { fillColor: [180, 150, 220] },
  });

  // Save PDF
  doc.save(`Team_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
