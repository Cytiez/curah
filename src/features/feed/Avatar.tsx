import { StyleSheet, Text, View } from 'react-native';

import { Chrome } from '@/theme';

const SIZE = 40;

interface AvatarProps {
  name: string;
}

/** Plain profile placeholder (initials on a neutral fill). The mood signal
 * lives entirely in the adjacent MoodBar, not on the avatar itself. */
export function Avatar({ name }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <View style={styles.fill}>
      <Text style={styles.initial}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Chrome.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: Chrome.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
