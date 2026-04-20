// src/components/Shimmer.tsx - Efeito de loading shimmer
import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  colors?: string[];
  style?: any;
}

// Componente de shimmer individual
export const Shimmer: React.FC<ShimmerProps> = ({
  width: shimmerWidth = 200,
  height = 20,
  borderRadius = 4,
  colors = ['#E5E7EB', '#F3F4F6', '#E5E7EB'],
  style,
}) => {
  const translateX = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: width,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          width: shimmerWidth,
          height,
          borderRadius,
          backgroundColor: colors[0],
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.gradient,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// Skeleton Card para Home
export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Shimmer width={60} height={60} borderRadius={30} />
        <View style={styles.cardHeaderText}>
          <Shimmer width={120} height={20} borderRadius={4} />
          <Shimmer width={80} height={14} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Shimmer width="100%" height={16} borderRadius={4} style={{ marginTop: 16 }} />
      <Shimmer width="80%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
      <Shimmer width="100%" height={44} borderRadius={8} style={{ marginTop: 20 }} />
    </View>
  );
};

// Skeleton para lista de itens
export const SkeletonListItem: React.FC = () => {
  return (
    <View style={styles.listItemContainer}>
      <Shimmer width={48} height={48} borderRadius={24} />
      <View style={styles.listItemText}>
        <Shimmer width="60%" height={18} borderRadius={4} />
        <Shimmer width="40%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <Shimmer width={60} height={28} borderRadius={14} />
    </View>
  );
};

// Skeleton para estatísticas
export const SkeletonStats: React.FC = () => {
  return (
    <View style={styles.statsContainer}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.statItem}>
          <Shimmer width={40} height={40} borderRadius={20} />
          <Shimmer width={50} height={28} borderRadius={4} style={{ marginTop: 8 }} />
          <Shimmer width={60} height={14} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
};

// Skeleton para avatar e nome
export const SkeletonAvatar: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={styles.avatarRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.avatarItem}>
          <Shimmer width={60} height={60} borderRadius={30} />
          <Shimmer width={50} height={14} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
};

// Tela de loading completa
export const SkeletonScreen: React.FC = () => {
  return (
    <View style={styles.screenContainer}>
      <SkeletonCard />
      <SkeletonStats />
      <View style={styles.listContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonListItem key={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    width: width,
    height: '100%',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    marginLeft: 16,
    flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  listItemText: {
    flex: 1,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avatarItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  screenContainer: {
    flex: 1,
    paddingTop: 16,
  },
  listContainer: {
    marginTop: 8,
  },
});

export default Shimmer;
