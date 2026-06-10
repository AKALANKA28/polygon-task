import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import { useTheme } from '../../theme/ThemeContext';
import type { Task } from '../../types/task.types';
import { normalize } from '../../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

interface CalendarScheduleViewProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const mockSlots = [
  { startHour: 8, startMin: 0, endHour: 9, endMin: 30, text: '8:00 AM - 9:30 AM' },
  { startHour: 10, startMin: 30, endHour: 12, endMin: 0, text: '10:30 AM - 12:00 PM' },
  { startHour: 12, startMin: 0, endHour: 13, endMin: 30, text: '12:00 PM - 1:30 PM' },
  { startHour: 14, startMin: 30, endHour: 16, endMin: 0, text: '2:30 PM - 4:00 PM' },
  { startHour: 16, startMin: 0, endHour: 17, endMin: 30, text: '4:00 PM - 5:30 PM' },
];

export default function CalendarScheduleView({ tasks, onTaskPress }: CalendarScheduleViewProps) {
  const { isDark, themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [baseDate, setBaseDate] = useState<Date>(new Date());

  // Monday of the week containing baseDate
  const mondayOfCurrentWeek = useMemo(() => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [baseDate]);

  // Generate 7 days of the week starting from Monday
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mondayOfCurrentWeek);
      d.setDate(mondayOfCurrentWeek.getDate() + i);
      return d;
    });
  }, [mondayOfCurrentWeek]);

  // Navigate to previous week
  const handlePrevWeek = () => {
    setBaseDate((prev) => subDays(prev, 7));
  };

  // Navigate to next week
  const handleNextWeek = () => {
    setBaseDate((prev) => addDays(prev, 7));
  };

  // Check if a date has tasks due on it
  const hasTasksOnDate = (date: Date) => {
    return tasks.some((task) => {
      if (!task.due_date) return false;
      try {
        const taskDate = new Date(task.due_date);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      } catch {
        return false;
      }
    });
  };

  // Filter tasks for the selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      try {
        const taskDate = new Date(task.due_date);
        return (
          taskDate.getFullYear() === selectedDate.getFullYear() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getDate() === selectedDate.getDate()
        );
      } catch {
        return false;
      }
    });
  }, [tasks, selectedDate]);

  // Assign mock time slots to filtered tasks
  const tasksWithSlots = useMemo(() => {
    return tasksForSelectedDate.map((task, index) => {
      const slot = mockSlots[index % mockSlots.length];
      return {
        ...task,
        slot,
      };
    });
  }, [tasksForSelectedDate]);

  // Priority based theme styles
  const getPriorityCardStyle = (priority: 'low' | 'medium' | 'high') => {
    if (isDark) {
      return {
        low: {
          bg: 'rgba(56, 189, 248, 0.15)',
          border: 'rgba(56, 189, 248, 0.3)',
          text: '#7DD3FC',
          desc: 'rgba(255,255,255,0.7)',
        },
        medium: {
          bg: 'rgba(251, 191, 36, 0.15)',
          border: 'rgba(251, 191, 36, 0.3)',
          text: '#FCD34D',
          desc: 'rgba(255,255,255,0.7)',
        },
        high: {
          bg: 'rgba(251, 113, 133, 0.15)',
          border: 'rgba(251, 113, 133, 0.3)',
          text: '#FDA4AF',
          desc: 'rgba(255,255,255,0.7)',
        },
      }[priority];
    } else {
      return {
        low: {
          bg: '#E0F2FE',
          border: '#BAE6FD',
          text: '#0369A1',
          desc: '#0284C7',
        },
        medium: {
          bg: '#FEF3C7',
          border: '#FDE68A',
          text: '#B45309',
          desc: '#D97706',
        },
        high: {
          bg: '#FFE4E6',
          border: '#FECDD3',
          text: '#9F1239',
          desc: '#E11D48',
        },
      }[priority];
    }
  };

  const headerHeight = normalize(60) + insets.top;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Month Year & week switcher */}
      <View style={[
        styles.headerContainer,
        {
          height: headerHeight,
          paddingTop: insets.top,
          backgroundColor: themeColors.card,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={handlePrevWeek} style={styles.chevronButton}>
              <Svg width={normalize(20)} height={normalize(20)} viewBox="0 0 24 24" fill="none" stroke={themeColors.text} strokeWidth={2.5}>
                <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            
            <Text style={[styles.monthText, { color: themeColors.text }]}>
              {format(baseDate, 'MMM yyyy')}
            </Text>

            <TouchableOpacity onPress={handleNextWeek} style={styles.chevronButton}>
              <Svg width={normalize(20)} height={normalize(20)} viewBox="0 0 24 24" fill="none" stroke={themeColors.text} strokeWidth={2.5}>
                <Path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
            <Svg width={normalize(20)} height={normalize(20)} viewBox="0 0 24 24" fill="none" stroke={themeColors.textSecondary} strokeWidth={2.5}>
              <Path d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
              <Path d="M19 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
              <Path d="M5 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Date Strip */}
      <View style={[styles.dateStrip, { borderBottomColor: themeColors.border }]}>
        {weekDays.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const dayName = format(date, 'eee'); // e.g. Mon, Tue
          const dayNum = format(date, 'd'); // e.g. 14, 15
          const hasTasks = hasTasksOnDate(date);

          const pillBg = isSelected
            ? isDark
              ? colors.white
              : colors.neutral[900]
            : 'transparent';

          const weekdayColor = isSelected
            ? isDark
              ? colors.black
              : colors.white
            : themeColors.textSecondary;

          const dateColor = isSelected
            ? isDark
              ? colors.black
              : colors.white
            : themeColors.text;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDate(date)}
              style={styles.dayCol}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayNameText, { color: weekdayColor, fontWeight: isSelected ? '700' : '400' }]}>
                {dayName}
              </Text>
              
              <View style={[styles.datePill, { backgroundColor: pillBg }]}>
                <Text style={[styles.dateNumberText, { color: dateColor, fontWeight: isSelected ? '700' : '500' }]}>
                  {dayNum}
                </Text>
              </View>

              {/* Task due indicator dot */}
              {hasTasks && (
                <View
                  style={[
                    styles.indicatorDot,
                    {
                      backgroundColor: isSelected
                        ? colors.brand.magenta
                        : themeColors.textSecondary,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timeline Schedule Scrollview */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineContent}>
        {tasksWithSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No tasks scheduled</Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              There are no tasks due on {format(selectedDate, 'EEEE, MMMM d')}.
            </Text>
          </View>
        ) : null}

        {HOURS.map((hour) => {
          // Find if there are tasks starting in this hour slot
          const tasksForHour = tasksWithSlots.filter((t) => t.slot.startHour === hour);
          const timeLabel = hour < 12 ? `${hour.toString().padStart(2, '0')} AM` : hour === 12 ? '12 PM' : `${(hour - 12).toString().padStart(2, '0')} PM`;

          return (
            <View key={hour} style={styles.timelineRow}>
              {/* Left Column: Time label */}
              <View style={styles.timeCol}>
                <Text style={[styles.timeLabelText, { color: themeColors.textSecondary }]}>
                  {timeLabel}
                </Text>
              </View>

              {/* Right Column: Grid line and cards */}
              <View style={[styles.gridCol, { borderTopColor: themeColors.border }]}>
                {tasksForHour.map((task) => {
                  const cardStyles = getPriorityCardStyle(task.priority);

                  return (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => onTaskPress(task)}
                      activeOpacity={0.9}
                      style={[
                        styles.taskCard,
                        {
                          backgroundColor: cardStyles.bg,
                          borderColor: cardStyles.border,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: cardStyles.text }]} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <View style={styles.cardMoreButton}>
                          <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={cardStyles.text} strokeWidth={2.5}>
                            <Path d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
                            <Path d="M19 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
                            <Path d="M5 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
                          </Svg>
                        </View>
                      </View>

                      {task.description ? (
                        <Text style={[styles.cardDesc, { color: cardStyles.desc }]} numberOfLines={1}>
                          {task.description}
                        </Text>
                      ) : null}

                      <View style={styles.cardFooter}>
                        <Text style={[styles.cardTime, { color: cardStyles.text }]}>
                          {task.slot.text}
                        </Text>

                        {task.assignees && task.assignees.length > 0 ? (
                          <View style={styles.avatarStack}>
                            <AvatarStack assignees={task.assignees} size={24} />
                          </View>
                        ) : task.assignee ? (
                          <View style={styles.avatarStack}>
                            <Avatar name={task.assignee.name} size={24} />
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {/* Empty block to pad out space in case no tasks start in this slot */}
                {tasksForHour.length === 0 && <View style={styles.emptyGridSpace} />}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chevronButton: {
    padding: spacing.xs,
  },
  monthText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg + 2,
    textAlign: 'center',
    minWidth: 100,
  },
  moreButton: {
    padding: spacing.xs,
  },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1.2,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayNameText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  datePill: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumberText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm + 1,
  },
  indicatorDot: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(2.5),
    marginTop: normalize(4),
  },
  timelineContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emptyContainer: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md + 1,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: normalize(75),
  },
  timeCol: {
    width: normalize(65),
    paddingTop: spacing.xs,
  },
  timeLabelText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs + 1,
    opacity: 0.8,
  },
  gridCol: {
    flex: 1,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  emptyGridSpace: {
    height: normalize(30),
  },
  taskCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  cardTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.base,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardMoreButton: {
    padding: 2,
  },
  cardDesc: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTime: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xs + 1,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlappingAvatar: {
    marginLeft: normalize(-8),
  },
});

const AvatarStack = ({ assignees, size = 24 }: { assignees: any[], size?: number }) => {
  if (!assignees || assignees.length === 0) return null;
  const visible = assignees.slice(0, 3);
  const remaining = assignees.length - visible.length;
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((item, idx) => (
        <View key={item.id} style={{ marginLeft: idx === 0 ? 0 : normalize(-8), zIndex: 10 - idx }}>
          <Avatar name={item.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View style={{
          marginLeft: normalize(-8),
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.neutral[600],
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.white,
          zIndex: 0,
        }}>
          <Text style={{ color: colors.white, fontSize: size * 0.4, fontFamily: typography.fonts.bold }}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};
