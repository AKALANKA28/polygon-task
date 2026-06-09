import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import GradientHeader from '../../../src/components/ui/GradientHeader';
import Avatar from '../../../src/components/ui/Avatar';
import Badge from '../../../src/components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../../src/store/hooks';
import { fetchTaskById, updateTask } from '../../../src/store/slices/tasksSlice';
import { toast } from '../../../src/utils/toast';
import { colors, getStatusColors, getPriorityColors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing, radius } from '../../../src/theme/spacing';
import { formatDate, formatRelativeTime, formatPriority, isDueDateOverdue, formatStatus } from '../../../src/utils/formatters';
import type { TaskStatus, TaskComment } from '../../../src/types/task.types';
import { useTheme } from '../../../src/theme/ThemeContext';
import { taskService } from '../../../src/services/taskService';
import { TextInput } from 'react-native';
import { normalize } from '../../../src/utils/responsive';

const getStatusColorsDark = (status: 'pending' | 'in_progress' | 'completed') => {
  const map = {
    pending: {
      bg: 'rgba(255, 184, 0, 0.15)',
      text: '#FFD166',
      dot: '#FFB800',
      border: 'rgba(255, 184, 0, 0.4)',
    },
    in_progress: {
      bg: 'rgba(255, 31, 142, 0.15)',
      text: '#FF80C4',
      dot: '#FF1F8E',
      border: 'rgba(255, 31, 142, 0.4)',
    },
    completed: {
      bg: 'rgba(139, 31, 204, 0.15)',
      text: '#C084FC',
      dot: '#8B1FCC',
      border: 'rgba(139, 31, 204, 0.4)',
    },
  };
  return map[status];
};

export default function EmployeeTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedTask: task } = useAppSelector((s) => s.tasks);
  const [updatingStatus, setUpdatingStatus] = useState<TaskStatus | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { isDark, themeColors } = useTheme();
  const styles = getStyles(isDark, themeColors);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    setIsLoadingComments(true);
    try {
      const data = await taskService.getComments(Number(id));
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setIsLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(Number(id)));
      fetchComments();
    }
  }, [id, dispatch, fetchComments]);

  const handleCommentSubmit = useCallback(async () => {
    if (!id || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const addedComment = await taskService.addComment(Number(id), newComment);
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toast.success('Comment added');
    } catch (err) {
      console.error('Failed to add comment', err);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  }, [id, newComment]);

  const handleStatusUpdate = useCallback(
    async (status: TaskStatus) => {
      if (!task || task.status === status) return;
      setUpdatingStatus(status);
      const result = await dispatch(updateTask({ id: task.id, dto: { status } }));
      if (updateTask.fulfilled.match(result)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(`Status updated to ${formatStatus(status)}`);
      } else {
        toast.error('Failed to update status');
      }
      setUpdatingStatus(null);
    },
    [task, dispatch]
  );

  if (!task) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="Task Detail"
          subtitle="Loading task info..."
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      </View>
    );
  }

  const priorityColors = getPriorityColors(task.priority);
  const isOverdue = isDueDateOverdue(task.due_date, task.status);

  const statusOptions: { value: TaskStatus; label: string; icon: string }[] = [
    { value: 'pending', label: 'Pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'in_progress', label: 'In Progress', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'completed', label: 'Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader
        title={task.title}
        subtitle="Task details and status update"
        showBackButton={true}
        backLabel="My Tasks"
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.contentCard}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Update */}
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusButtons}>
            {statusOptions.map((option) => {
              const isSelected = task.status === option.value;
              const statusColors = isDark ? getStatusColorsDark(option.value) : getStatusColors(option.value);
              const isUpdating = updatingStatus === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusButton,
                    isSelected
                      ? { backgroundColor: statusColors.dot, borderColor: statusColors.dot }
                      : { borderColor: statusColors.border, backgroundColor: statusColors.bg },
                  ]}
                  onPress={() => handleStatusUpdate(option.value)}
                  disabled={updatingStatus !== null}
                  activeOpacity={0.7}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={isSelected ? colors.white : statusColors.dot} />
                  ) : (
                    <>
                      {isSelected && (
                        <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2.5}>
                          <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                      <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={isSelected ? colors.white : statusColors.text} strokeWidth={1.8}>
                        <Path d={option.icon} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: isSelected ? colors.white : statusColors.text },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Badge
              label={formatPriority(task.priority)}
              backgroundColor={priorityColors.bg}
              textColor={priorityColors.text}
              borderColor={priorityColors.border}
            />
          </View>

          {task.creator && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned by</Text>
              <View style={styles.detailValue}>
                <Avatar name={task.creator.name} size={24} />
                <Text style={styles.detailText}>{task.creator.name}</Text>
              </View>
            </View>
          )}

          {task.assignees && task.assignees.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned to</Text>
              <View style={{ gap: spacing.sm, alignItems: 'flex-end' }}>
                {task.assignees.map((assignee) => (
                  <View key={assignee.id} style={[styles.detailValue, { marginVertical: 2 }]}>
                    <Avatar name={assignee.name} size={24} />
                    <Text style={styles.detailText}>{assignee.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <View style={styles.detailValue}>
              <Svg width={normalize(16)} height={normalize(16)} viewBox="0 0 24 24" fill="none" stroke={isOverdue ? colors.semantic.error : (isDark ? colors.neutral[400] : colors.neutral[500])} strokeWidth={1.8}>
                <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.detailText, isOverdue && { color: colors.semantic.error }]}>
                {formatDate(task.due_date)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailText}>{formatRelativeTime(task.created_at)}</Text>
          </View>

          {task.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Task Updates & Comments</Text>
          
          {isLoadingComments ? (
            <ActivityIndicator size="small" color={colors.primary.DEFAULT} style={{ marginVertical: spacing.md }} />
          ) : comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet. Add an update below.</Text>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentUser}>
                      <Avatar name={comment.user_name} size={24} />
                      <Text style={styles.commentUserName}>{comment.user_name}</Text>
                      <Badge
                        label={comment.user_role === 'admin' ? 'Admin' : 'Employee'}
                        backgroundColor={comment.user_role === 'admin' ? colors.brand.magenta : colors.brand.purple}
                        textColor={colors.white}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.commentTime}>{formatRelativeTime(comment.created_at)}</Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Add Comment Input */}
          <View style={styles.addCommentContainer}>
            <TextInput
              placeholder="Type a progress update or comment..."
              placeholderTextColor={isDark ? colors.neutral[400] : colors.neutral[500]}
              value={newComment}
              onChangeText={setNewComment}
              style={styles.commentInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleCommentSubmit}
              disabled={isSubmittingComment || !newComment.trim()}
              style={[
                styles.sendButton,
                (!newComment.trim() || isSubmittingComment) && styles.sendButtonDisabled,
              ]}
              activeOpacity={0.7}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Svg width={normalize(18)} height={normalize(18)} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={2}>
                  <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, themeColors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    contentCard: {
      flex: 1, backgroundColor: themeColors.card, marginTop: -20,
      borderTopLeftRadius: radius['2xl'], borderTopRightRadius: radius['2xl'],
    },
    contentInner: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
    sectionTitle: {
      fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.md,
      color: themeColors.text, marginBottom: spacing.md,
    },
    statusButtons: { gap: spacing.sm, marginBottom: spacing.xl },
    statusButton: {
      height: 52, borderRadius: radius.md, borderWidth: 1.5,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    },
    statusButtonText: { fontFamily: typography.fonts.semiBold, fontSize: typography.sizes.base },
    detailsSection: { gap: spacing.base },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: themeColors.textSecondary },
    detailValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    detailText: { fontFamily: typography.fonts.medium, fontSize: typography.sizes.base, color: themeColors.text },
    descriptionSection: { marginTop: spacing.md },
    description: {
      fontFamily: typography.fonts.regular, fontSize: typography.sizes.base, color: themeColors.text,
      lineHeight: typography.sizes.base * typography.lineHeights.relaxed, marginTop: spacing.sm,
    },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    commentsSection: {
      marginTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      paddingTop: spacing.xl,
    },
    noCommentsText: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.sm + 1,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginVertical: spacing.lg,
    },
    commentsList: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    commentCard: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.neutral[50],
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    commentUser: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    commentUserName: {
      fontFamily: typography.fonts.semiBold,
      fontSize: typography.sizes.sm + 1,
      color: themeColors.text,
      marginLeft: spacing.xs - 2,
    },
    commentTime: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.xs + 1,
      color: themeColors.textSecondary,
    },
    commentContent: {
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.base,
      color: themeColors.text,
      lineHeight: normalize(20),
      marginTop: spacing.xs,
    },
    addCommentContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    commentInput: {
      flex: 1,
      minHeight: normalize(46),
      maxHeight: 120,
      backgroundColor: themeColors.whiteOrCard,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingTop: normalize(12),
      paddingBottom: normalize(12),
      fontFamily: typography.fonts.regular,
      fontSize: typography.sizes.base,
      color: themeColors.text,
    },
    sendButton: {
      width: normalize(46),
      height: normalize(46),
      borderRadius: radius.md,
      backgroundColor: colors.primary.DEFAULT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[300],
      opacity: 0.6,
    },
  });
