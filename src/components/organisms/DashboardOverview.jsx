import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import {
  AssignmentTurnedIn,
  CheckCircle,
  EventBusy,
  EventNote,
  HourglassEmpty,
  Person,
  PersonAddAlt1,
  School,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../molecules';
import {
  GetAttendanceByClass,
  GetMyAssignments,
  GetMyChildrenAttendanceStatus,
  GetMyClassesByUserId,
  GetSimpleDashboardReport,
  GetTeacherAssignmentSummary,
} from '../../services';
import colors from '../../styles/colors';

const SUPPORTED_ROLES = ['admin', 'teacher', 'student', 'parent'];

const DEFAULT_ADMIN_SUMMARY = {
  attendance: {
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0,
  },
  submissions: {
    totalSubmissions: 0,
    onTime: 0,
    late: 0,
  },
  assignments: {
    totalAssignmentsCreated: 0,
  },
  grades: {
    avgNumericGrade: 0,
  },
  users: {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    pendingApprovals: 0,
  },
};

const DEFAULT_TEACHER_SUMMARY = {
  totalAssignments: 0,
  totalDue: 0,
  pastDue: 0,
  totalSubmissions: 0,
  onTimeSubmissions: 0,
  lateSubmissions: 0,
};

const DEFAULT_TEACHER_CLASS_METRICS = {
  assignedClassesCount: 0,
  markedToday: 0,
  notMarkedToday: 0,
  classNames: [],
};

const DEFAULT_PARENT_REPORT = {
  summary: { 
    present: 0,
    absent: 0,
    notMarkedYet: 0,
  },
  students: [], 
};

const DEFAULT_STUDENT_METRICS = {
  totalDueAssignments: 0,
  overdueAssignments: 0,
  dueThisWeek: 0,
};

const DASHBOARD_CARD_COLOR = colors.primary.main;

const normalizeRole = (value) => String(value || '').trim().toLowerCase();

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const getEntityId = (entity) => {
  return String(entity?._id || entity?.id || '').trim();
};

const isVisibleForRole = (visibleRoles, role) => {
  if (!Array.isArray(visibleRoles) || visibleRoles.length === 0) {
    return true;
  }

  return visibleRoles.includes(role);
};

const isSameCalendarDay = (value, referenceDate = new Date()) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getDate() === referenceDate.getDate()
  );
};

const isOverdue = (value, referenceDate = new Date()) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date < referenceDate;
};

const isDueWithinDays = (value, days, referenceDate = new Date()) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const limit = new Date(referenceDate);
  limit.setDate(limit.getDate() + days);

  return date >= referenceDate && date <= limit;
};

const getClassName = (classItem) => {
  if (!classItem) return 'Class Not Assigned';

  if (classItem.className) return String(classItem.className).trim();
  if (classItem.name) return String(classItem.name).trim();

  const level = classItem.level ? `Grade ${classItem.level}` : '';
  const order = classItem.order || '';
  const year = classItem.year ? ` ${classItem.year}` : '';
  const generated = `${level}${order}${year}`.trim();

  return generated || 'Class Not Assigned';
};

const getClassesFromResponse = (response) => {
  return toArray(
    response?.data,
    response?.classes,
    response?.myClasses,
    response?.data?.data,
    response?.data?.classes,
    response?.data?.myClasses
  );
};

const getAssignmentsFromResponse = (response) => {
  return toArray(response?.assignments, response?.data?.assignments, response?.data);
};

const getAttendanceFromResponse = (response) => {
  return toArray(
    response?.attendance,
    response?.records,
    response?.data?.attendance,
    response?.data?.records,
    response?.data
  );
};

const normalizeAdminSummary = (response) => {
  const summary = response?.summary || response?.data?.summary || {};

  return {
    attendance: {
      present: toNumber(summary?.attendance?.present),
      absent: toNumber(summary?.attendance?.absent),
      late: toNumber(summary?.attendance?.late),
      attendanceRate: toNumber(summary?.attendance?.attendanceRate),
    },
    submissions: {
      totalSubmissions: toNumber(summary?.submissions?.totalSubmissions),
      onTime: toNumber(summary?.submissions?.onTime),
      late: toNumber(summary?.submissions?.late),
    },
    assignments: {
      totalAssignmentsCreated: toNumber(summary?.assignments?.totalAssignmentsCreated),
    },
    grades: {
      avgNumericGrade: toNumber(summary?.grades?.avgNumericGrade),
    },
    users: {
      totalStudents: toNumber(summary?.users?.totalStudents),
      totalTeachers: toNumber(summary?.users?.totalTeachers),
      totalParents: toNumber(summary?.users?.totalParents),
      pendingApprovals: toNumber(summary?.users?.pendingApprovals),
    },
  };
};

const normalizeTeacherSummary = (response) => {
  const summary = response?.summary || response?.data?.summary || {};

  return {
    totalAssignments: toNumber(summary?.totalAssignments),
    totalDue: toNumber(summary?.totalDue),
    pastDue: toNumber(summary?.pastDue),
    totalSubmissions: toNumber(summary?.totalSubmissions),
    onTimeSubmissions: toNumber(summary?.onTimeSubmissions),
    lateSubmissions: toNumber(summary?.lateSubmissions),
  };
};

const normalizeParentStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized.includes('absent')) return 'absent';
  if (normalized.includes('present') || normalized.includes('late')) return 'present';
  if (normalized.includes('not') || normalized.includes('unmarked')) return 'not_marked';

  return 'not_marked';
};

const normalizeParentReport = (response) => {
  const summary = response?.summary || response?.data?.summary || {};
  const students = toArray(response?.students, response?.data?.students);

  return {
    summary: {
      present: toNumber(summary?.present),
      absent: toNumber(summary?.absent),
      notMarkedYet: toNumber(summary?.notMarkedYet),
    },
    students: students.map((student, index) => {
      const id = String(student?.studentId || student?._id || student?.id || `student-${index}`);
      const firstName = String(student?.firstName || '').trim();
      const lastName = String(student?.lastName || '').trim();
      const accountNumber = String(student?.accountNumber || 'N/A').trim();
      const classLabel = String(student?.classId || 'Class Not Assigned').trim();
      const statusText = String(student?.attendanceStatus || 'Not Marked Yet').trim();

      return {
        id,
        firstName,
        lastName,
        accountNumber,
        classLabel,
        statusText,
        statusKey: normalizeParentStatus(student?.attendanceStatus || student?.rawAttendanceStatus),
      };
    }),
  };
};

const buildTeacherClassMetrics = async (classes = []) => {
  const classIds = classes.map((classItem) => getEntityId(classItem)).filter(Boolean);

  if (classIds.length === 0) {
    return DEFAULT_TEACHER_CLASS_METRICS;
  }

  const attendanceChecks = await Promise.allSettled(
    classIds.map((classId) => GetAttendanceByClass(classId))
  );

  let markedToday = 0;

  attendanceChecks.forEach((result) => {
    if (result.status !== 'fulfilled') {
      return;
    }

    const records = getAttendanceFromResponse(result.value);
    const hasMarkedToday = records.some((record) => isSameCalendarDay(record?.date || record?.createdAt));

    if (hasMarkedToday) {
      markedToday += 1;
    }
  });

  return {
    assignedClassesCount: classIds.length,
    markedToday,
    notMarkedToday: Math.max(classIds.length - markedToday, 0),
    classNames: classes.map((classItem) => getClassName(classItem)).filter(Boolean).slice(0, 4),
  };
};

const formatClassList = (classNames = []) => {
  if (classNames.length === 0) {
    return 'No assigned classes available';
  }

  return classNames.join(', ');
};

const withUnifiedColor = (cards = []) => {
  return cards.map((card) => ({ ...card, color: DASHBOARD_CARD_COLOR }));
};

const CardsGrid = ({ children, columns }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns || {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
        alignItems: 'stretch',
        justifyContent: 'stretch',
      }}
    >
      {children}
    </Box>
  );
};

const DashboardOverview = ({ user, role }) => {
  const navigate = useNavigate();
  const normalizedRole = useMemo(() => normalizeRole(role), [role]);
  const userId = useMemo(() => user?.id || user?._id || '', [user]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminSummary, setAdminSummary] = useState(DEFAULT_ADMIN_SUMMARY);
  const [teacherSummary, setTeacherSummary] = useState(DEFAULT_TEACHER_SUMMARY);
  const [teacherClassMetrics, setTeacherClassMetrics] = useState(DEFAULT_TEACHER_CLASS_METRICS);
  const [parentReport, setParentReport] = useState(DEFAULT_PARENT_REPORT);
  const [studentMetrics, setStudentMetrics] = useState(DEFAULT_STUDENT_METRICS);

  const loadAdminOverview = useCallback(async () => {
    const report = await GetSimpleDashboardReport({ granularity: 'month' });
    setAdminSummary(normalizeAdminSummary(report));
  }, []);

  const loadParentOverview = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const report = await GetMyChildrenAttendanceStatus({ date: today });
    setParentReport(normalizeParentReport(report));
  }, []);

  const loadTeacherOverview = useCallback(async () => {
    if (!userId) {
      throw new Error('Unable to determine teacher account. Please log in again.');
    }

    const [summaryResult, classesResult] = await Promise.allSettled([
      GetTeacherAssignmentSummary(),
      GetMyClassesByUserId(userId),
    ]);

    const nextTeacherSummary = summaryResult.status === 'fulfilled'
      ? normalizeTeacherSummary(summaryResult.value)
      : DEFAULT_TEACHER_SUMMARY;

    const classes = classesResult.status === 'fulfilled'
      ? getClassesFromResponse(classesResult.value)
      : [];

    const nextTeacherClassMetrics = await buildTeacherClassMetrics(classes);

    setTeacherSummary(nextTeacherSummary);
    setTeacherClassMetrics(nextTeacherClassMetrics);

    if (summaryResult.status === 'rejected' && classesResult.status === 'rejected') {
      throw new Error('Unable to load teacher dashboard data right now.');
    }
  }, [userId]);

  const loadStudentOverview = useCallback(async () => {
    const response = await GetMyAssignments();
    const assignments = getAssignmentsFromResponse(response);

    setStudentMetrics({
      totalDueAssignments: assignments.length,
      overdueAssignments: assignments.filter((item) => isOverdue(item?.deadline)).length,
      dueThisWeek: assignments.filter((item) => isDueWithinDays(item?.deadline, 7)).length,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      setLoading(true);
      setError('');

      try {
        if (normalizedRole === 'admin') {
          await loadAdminOverview();
        } else if (normalizedRole === 'teacher') {
          await loadTeacherOverview();
        } else if (normalizedRole === 'parent') {
          await loadParentOverview();
        } else if (normalizedRole === 'student') {
          await loadStudentOverview();
        } else {
          throw new Error('Role is not supported for dashboard view.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load dashboard data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (SUPPORTED_ROLES.includes(normalizedRole)) {
      loadOverview();
    } else {
      setLoading(false);
      setError('Role is not supported for dashboard view.');
    }

    return () => {
      cancelled = true;
    };
  }, [loadAdminOverview, loadParentOverview, loadStudentOverview, loadTeacherOverview, normalizedRole]);

  const adminCards = useMemo(() => {
    return withUnifiedColor([
      {
        key: 'pending-approvals',
        visibleRoles: ['admin'],
        title: 'Pending Approvals',
        value: adminSummary.users.pendingApprovals,
        subtitle: 'Open user management to review',
        icon: <PersonAddAlt1 fontSize="small" />,
        onClick: () => navigate('/user-management'),
      },
      {
        key: 'students-total',
        visibleRoles: ['admin'],
        title: 'Total Students',
        value: adminSummary.users.totalStudents,
        subtitle: 'Active student accounts',
        icon: <School fontSize="small" />,
      },
      {
        key: 'teachers-total',
        visibleRoles: ['admin'],
        title: 'Total Teachers',
        value: adminSummary.users.totalTeachers,
        subtitle: 'Teaching staff accounts',
        icon: <Person fontSize="small" />,
      },
      {
        key: 'parents-total',
        visibleRoles: ['admin'],
        title: 'Total Parents',
        value: adminSummary.users.totalParents,
        subtitle: 'Linked parent accounts',
        icon: <Person fontSize="small" />,
      },
      {
        key: 'attendance-rate',
        visibleRoles: ['admin'],
        title: 'Attendance Rate',
        value: `${adminSummary.attendance.attendanceRate.toFixed(2)}%`,
        subtitle: `P:${adminSummary.attendance.present} A:${adminSummary.attendance.absent} L:${adminSummary.attendance.late}`,
        icon: <CheckCircle fontSize="small" />,
      },
      {
        key: 'assignments-created',
        visibleRoles: ['admin'],
        title: 'Assignments Created',
        value: adminSummary.assignments.totalAssignmentsCreated,
        subtitle: 'Total assignments created',
        icon: <AssignmentTurnedIn fontSize="small" />,
      },
      {
        key: 'submissions-total',
        visibleRoles: ['admin'],
        title: 'Submissions',
        value: adminSummary.submissions.totalSubmissions,
        subtitle: `On-time ${adminSummary.submissions.onTime} | Late ${adminSummary.submissions.late}`,
        icon: <TrendingUp fontSize="small" />,
      },
    ]);
  }, [adminSummary, navigate]);

  const adminComingSoonCards = useMemo(() => {
    return withUnifiedColor([
      {
        key: 'admin-notifications-today',
        visibleRoles: ['admin'],
        variant: 'placeholder',
        title: 'Notifications Sent Today',
        subtitle: 'Notification activity card is coming soon.',
      },
      {
        key: 'admin-system-health',
        visibleRoles: ['admin'],
        variant: 'placeholder',
        title: 'System Health',
        subtitle: 'Uptime and latency monitoring integration is coming soon.',
      },
    ]);
  }, []);

  const teacherCards = useMemo(() => {
    return withUnifiedColor([
      {
        key: 'teacher-total-assignments',
        visibleRoles: ['teacher'],
        title: 'Total Assignments By Me',
        value: teacherSummary.totalAssignments,
        subtitle: 'From assignment summary report',
        icon: <AssignmentTurnedIn fontSize="small" />,
      },
      {
        key: 'teacher-total-due',
        visibleRoles: ['teacher'],
        title: 'Assignments Due',
        value: teacherSummary.totalDue,
        subtitle: 'Assignments still within deadline',
        icon: <CheckCircle fontSize="small" />,
      },
      {
        key: 'teacher-past-due',
        visibleRoles: ['teacher'],
        title: 'Past Due Assignments',
        value: teacherSummary.pastDue,
        subtitle: 'Assignments past deadline',
        icon: <HourglassEmpty fontSize="small" />,
      },
      {
        key: 'teacher-submissions-total',
        visibleRoles: ['teacher'],
        title: 'Total Submissions',
        value: teacherSummary.totalSubmissions,
        subtitle: `On-time ${teacherSummary.onTimeSubmissions} | Late ${teacherSummary.lateSubmissions}`,
        icon: <TrendingUp fontSize="small" />,
      },
      {
        key: 'teacher-assigned-classes',
        visibleRoles: ['teacher'],
        title: 'My Assigned Classes',
        value: teacherClassMetrics.assignedClassesCount,
        subtitle: formatClassList(teacherClassMetrics.classNames),
        icon: <School fontSize="small" />,
      },
      {
        key: 'teacher-attendance-marked',
        visibleRoles: ['teacher'],
        title: 'Attendance Marked Today',
        value: teacherClassMetrics.markedToday,
        subtitle: 'Assigned classes with attendance marked',
        icon: <EventNote fontSize="small" />,
      },
      {
        key: 'teacher-attendance-pending',
        visibleRoles: ['teacher'],
        title: 'Attendance Pending Today',
        value: teacherClassMetrics.notMarkedToday,
        subtitle: 'Assigned classes still pending',
        icon: <EventBusy fontSize="small" />,
      },
      {
        key: 'teacher-reminder-campaign',
        visibleRoles: ['teacher'],
        variant: 'placeholder',
        title: 'Reminder Campaign',
        subtitle: 'Automated reminder insights are coming soon.',
      },
    ]);
  }, [teacherSummary, teacherClassMetrics]);

  const parentSummaryCards = useMemo(() => {
    return withUnifiedColor([
      {
        key: 'parent-present-today',
        visibleRoles: ['parent'],
        title: 'Present Today',
        value: parentReport.summary.present,
        subtitle: 'Children marked present',
        icon: <CheckCircle fontSize="small" />,
      },
      {
        key: 'parent-absent-today',
        visibleRoles: ['parent'],
        title: 'Absent Today',
        value: parentReport.summary.absent,
        subtitle: 'Children marked absent',
        icon: <EventBusy fontSize="small" />,
      },
      {
        key: 'parent-not-marked-today',
        visibleRoles: ['parent'],
        title: 'Not Marked Yet',
        value: parentReport.summary.notMarkedYet,
        subtitle: 'Attendance pending for today',
        icon: <HourglassEmpty fontSize="small" />,
      },
    ]);
  }, [parentReport.summary]);

  const parentStudentCards = useMemo(() => {
    const cards = parentReport.students.map((student) => ({
        key: `parent-student-${student.id}`,
        visibleRoles: ['parent'],
        variant: 'status',
        title: `${student.firstName} ${student.lastName}`.trim() || 'Student',
        subtitle: student.classLabel,
        value: `Account: ${student.accountNumber}`,
        statusLabel: student.statusText,
        icon: <Person sx={{ color: DASHBOARD_CARD_COLOR }} fontSize="small" />,
      }));

    return withUnifiedColor(cards);
  }, [parentReport.students]);

  const parentComingSoonCards = useMemo(() => {
    return withUnifiedColor([
      {
        key: 'parent-performance-snapshot',
        visibleRoles: ['parent'],
        variant: 'placeholder',
        title: 'Performance Snapshot',
        subtitle: 'Progress and grade trends for your children are coming soon.',
      },
      {
        key: 'parent-comments',
        visibleRoles: ['parent'],
        variant: 'placeholder',
        title: 'Tutor Feedback',
        subtitle: 'Behavior and comment reporting is coming soon.',
      },
    ]);
  }, []);

  const studentCards = useMemo(() => {
    return withUnifiedColor([
      {
        key: 'student-total-due',
        visibleRoles: ['student'],
        title: 'Total Due Assignments',
        value: studentMetrics.totalDueAssignments,
        subtitle: 'Assignments currently assigned',
        icon: <AssignmentTurnedIn fontSize="small" />,
      },
      {
        key: 'student-overdue',
        visibleRoles: ['student'],
        title: 'Overdue Assignments',
        value: studentMetrics.overdueAssignments,
        subtitle: 'Assignments past deadline',
        icon: <EventBusy fontSize="small" />,
      },
      {
        key: 'student-due-week',
        visibleRoles: ['student'],
        title: 'Due This Week',
        value: studentMetrics.dueThisWeek,
        subtitle: 'Assignments due in 7 days',
        icon: <EventNote fontSize="small" />,
      },
      {
        key: 'student-attendance-trend',
        visibleRoles: ['student'],
        variant: 'placeholder',
        title: 'Attendance Trend',
        subtitle: 'Attendance trend charts are coming soon.',
      },
      {
        key: 'student-performance-report',
        visibleRoles: ['student'],
        variant: 'placeholder',
        title: 'Performance Report',
        subtitle: 'Detailed performance report is coming soon.',
      },
    ]);
  }, [studentMetrics]);

  const dashboardSections = useMemo(() => {
    return [
      {
        key: 'admin-overview',
        title: 'Admin Overview',
        visibleRoles: ['admin'],
        cards: adminCards,
        columns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
      },
      {
        key: 'admin-coming-soon',
        title: 'Admin Insights',
        visibleRoles: ['admin'],
        cards: adminComingSoonCards,
      },
      {
        key: 'teacher-overview',
        title: 'Teacher Overview',
        visibleRoles: ['teacher'],
        cards: teacherCards,
      },
      {
        key: 'parent-overview',
        title: 'Parent Overview',
        visibleRoles: ['parent'],
        cards: parentSummaryCards,
        columns: {
          xs: '1fr',
          sm: 'repeat(3, minmax(0, 1fr))',
        },
      },
      {
        key: 'parent-students',
        title: 'My Children',
        visibleRoles: ['parent'],
        cards: parentStudentCards,
      },
      {
        key: 'parent-coming-soon',
        title: 'Parent Reports',
        visibleRoles: ['parent'],
        cards: parentComingSoonCards,
      },
      {
        key: 'student-overview',
        title: 'Student Overview',
        visibleRoles: ['student'],
        cards: studentCards,
      },
    ];
  }, [adminCards, adminComingSoonCards, parentComingSoonCards, parentStudentCards, parentSummaryCards, studentCards, teacherCards]);

  const visibleSections = useMemo(() => {
    return dashboardSections.filter((section) => isVisibleForRole(section.visibleRoles, normalizedRole));
  }, [dashboardSections, normalizedRole]);

  if (loading) {
    return (
      <CardsGrid>
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} variant="rounded" height={150} />
        ))}
      </CardsGrid>
    );
  }

  return (
    <Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {visibleSections.map((section, index) => {
        const cardsForRole = section.cards.filter((card) => isVisibleForRole(card.visibleRoles, normalizedRole));

        if (cardsForRole.length === 0) {
          return null;
        }

        return (
          <Box key={section.key} sx={{ mt: index === 0 ? 0 : 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: colors.text.primary }}>
              {section.title}
            </Typography>
            <CardsGrid columns={section.columns}>
              {cardsForRole.map((card) => {
                const { key, visibleRoles: _visibleRoles, ...cardProps } = card;
                void _visibleRoles;
                return <DashboardCard key={key} {...cardProps} />;
              })}
            </CardsGrid>
          </Box>
        );
      })}

      {!SUPPORTED_ROLES.includes(normalizedRole) ? (
        <Box sx={{ mt: 3 }}>
          <DashboardCard
            variant="placeholder"
            title="Dashboard Unavailable"
            subtitle="This account role does not have a configured dashboard view yet."
            color={DASHBOARD_CARD_COLOR}
          />
        </Box>
      ) : null}

      {normalizedRole === 'parent' && parentReport.students.length === 0 ? (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">No children were returned for this parent account.</Alert>
        </Box>
      ) : null}
    </Box>
  );
};

export default DashboardOverview;
