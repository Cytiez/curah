import { StyleSheet, Text, View } from 'react-native';

import { Chrome, Typography } from '@/theme';

export default function RecapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Recap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Chrome.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...Typography.heading, color: Chrome.text },
});
