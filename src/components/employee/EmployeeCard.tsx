import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing, shadows } from '../../theme/spacing';
import Avatar from '../ui/Avatar';
import type { Employee } from '../../types/employee.types';
import { useTheme } from '../../theme/ThemeContext';

interface EmployeeCardProps {
  employee: Employee;
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const { themeColors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }, shadows.sm]}>
      <Avatar name={employee.name} size={44} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={1}>
          {employee.name}
        </Text>
        <Text style={[styles.email, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {employee.email}
        </Text>
        {(employee.department || employee.phone) && (
          <View style={styles.detailsRow}>
            {employee.department && (
              <Text style={[styles.detailText, { color: themeColors.textSecondary }]} numberOfLines={1}>
                🏢 {employee.department}
              </Text>
            )}
            {employee.phone && (
              <Text style={[styles.detailText, { color: themeColors.textSecondary }]} numberOfLines={1}>
                📞 {employee.phone}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.base + 1,
  },
  email: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    marginTop: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  detailText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs + 1,
  },
});
