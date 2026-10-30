import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import {
  Modal,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, Theme } from '../constants/themes';
import { useTheme } from '../lib/store';

export type IconName = React.ComponentProps<typeof Feather>['name'];

const VARIANTS = {
  display: { fontFamily: FONTS.serifSemiBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.3 },
  title: { fontFamily: FONTS.serifSemiBold, fontSize: 22, lineHeight: 29 },
  heading: { fontFamily: FONTS.serifSemiBold, fontSize: 17, lineHeight: 23 },
  serif: { fontFamily: FONTS.serif, fontSize: 16, lineHeight: 25 },
  quote: { fontFamily: FONTS.serifItalic, fontSize: 18, lineHeight: 27 },
  body: { fontFamily: FONTS.sans, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: FONTS.sansSemiBold, fontSize: 15, lineHeight: 20 },
  small: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: FONTS.sansMedium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: FONTS.sansBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'success' | 'onAccent';

function toneColor(theme: Theme, tone: Tone) {
  switch (tone) {
    case 'muted':
      return theme.textMuted;
    case 'faint':
      return theme.textFaint;
    case 'accent':
      return theme.accent;
    case 'danger':
      return theme.danger;
    case 'success':
      return theme.success;
    case 'onAccent':
      return theme.onAccent;
    default:
      return theme.text;
  }
}

export function Txt({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TextProps & { variant?: keyof typeof VARIANTS; tone?: Tone }) {
  const theme = useTheme();
  return <Text {...rest} style={[VARIANTS[variant], { color: toneColor(theme, tone) }, style]} />;
}

export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>{children}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border }, style]} />;
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  icon,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  icon?: IconName;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const bg =
    variant === 'primary' ? theme.accent : variant === 'secondary' ? theme.subtle : variant === 'danger' ? theme.danger : 'transparent';
  const fg = variant === 'primary' ? theme.onAccent : variant === 'danger' ? '#ffffff' : variant === 'ghost' ? theme.accent : theme.text;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' ? styles.buttonSm : styles.buttonMd,
        variant === 'ghost' && styles.buttonGhost,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={size === 'sm' ? 14 : 16} color={fg} /> : null}
      <Text style={[size === 'sm' ? VARIANTS.caption : VARIANTS.label, { color: fg }, size === 'sm' && { fontFamily: FONTS.sansSemiBold }]}>
        {loading ? 'One moment…' : title}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'muted',
  filled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: Tone;
  filled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: filled ? theme.accent : pressed ? theme.subtle : 'transparent' },
      ]}
    >
      <Feather name={icon} size={20} color={filled ? theme.onAccent : toneColor(theme, tone)} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  leading,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.card,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {leading}
      <Text style={[VARIANTS.caption, { color: selected ? theme.onAccent : theme.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: theme.subtle }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && { backgroundColor: theme.card, ...styles.shadow }]}
          >
            <Text style={[VARIANTS.caption, { color: active ? theme.text : theme.textMuted }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) {
  const theme = useTheme();
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.border, true: theme.accent }}
      thumbColor="#ffffff"
      ios_backgroundColor={theme.border}
    />
  );
}

export function SettingRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const content = (
    <>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: theme.subtle }]}>
          <Feather name={icon} size={16} color={theme.textMuted} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Txt variant="label">{title}</Txt>
        {subtitle ? (
          <Txt variant="small" tone="muted">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={18} color={theme.textFaint} /> : null)}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      {content}
    </Pressable>
  );
}

export function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const header = title ? (
    <View style={styles.screenHeader}>
      <View style={{ flex: 1 }}>
        <Txt variant="title" accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="small" tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  ) : null;

  if (!scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top + 8 }}>
        <View style={{ paddingHorizontal: 20 }}>{header}</View>
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {header}
      {children}
    </ScrollView>
  );
}

export function Dialog({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={[styles.dialog, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => {}}>
          <Txt variant="heading" style={{ marginBottom: 10 }}>
            {title}
          </Txt>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  buttonMd: { minHeight: 48, paddingHorizontal: 18 },
  buttonSm: { minHeight: 36, paddingHorizontal: 12, borderRadius: 10 },
  buttonGhost: { paddingHorizontal: 4 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 12,
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 8,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 22,
  },
});
