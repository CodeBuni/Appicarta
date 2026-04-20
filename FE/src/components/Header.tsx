// src/components/Header.tsx - Header premium com blur effect
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Animated as RNAnimated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../styles/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { HapticButton } from './HapticButton';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightIconPress?: () => void;
  logo?: ImageSourcePropType;
  showNotifications?: boolean;
  showAvatar?: boolean;

  // Props para Home
  onLogoPress?: () => void;
  onNotificationsPress?: () => void;
  onUserPress?: () => void;
  unreadCount?: number;
  userAvatar?: string;

  // Blur effect
  blur?: boolean;
  scrollY?: number;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightIconPress,
  logo = require('../styles/titulo.png'),
  showNotifications = true,
  showAvatar = true,
  onLogoPress,
  onNotificationsPress,
  onUserPress,
  unreadCount = 0,
  userAvatar,
  blur = true,
  scrollY = 0,
}) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [isScrolled, setIsScrolled] = useState(false);

  // Animação baseada no scroll
  useEffect(() => {
    setIsScrolled(scrollY > 50);
  }, [scrollY]);

  const handleLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
    } else {
      navigation.navigate('AboutAppicartaScreen');
    }
  };

  const handleNotificationsPress = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    } else {
      navigation.navigate('Notifications');
    }
  };

  const handleAvatarPress = () => {
    if (onUserPress) {
      onUserPress();
    } else {
      navigation.navigate('UserScreen');
    }
  };

  const handleBackButtonPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const renderAvatar = () => {
    if (userAvatar) {
      return (
        <Animated.View entering={FadeInRight.duration(300)}>
          <Image
            source={{ uri: userAvatar }}
            style={[styles.avatarImage, { borderRadius: 20 }]}
          />
          <View style={[styles.statusIndicator, {
            backgroundColor: '#10B981',
            borderColor: theme.colors.surface
          }]} />
        </Animated.View>
      );
    }
    return (
      <Icon name="account-circle" size={40} color={theme.colors.primary as string} />
    );
  };

  const renderBackground = () => {
    if (blur && isScrolled) {
      return (
        <BlurView
          intensity={isDarkMode ? 60 : 80}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      );
    }
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isScrolled
              ? theme.colors.surface
              : theme.colors.surface,
            opacity: isScrolled ? 1 : 0.95,
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.wrapper}>
      {renderBackground()}
      <View style={[styles.container, {
        borderBottomColor: isScrolled ? theme.colors.borderLight : 'transparent',
        borderBottomWidth: isScrolled ? 1 : 0,
      }]}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <HapticButton
              variant="ghost"
              size="small"
              icon="chevron-left"
              onPress={handleBackButtonPress}
              haptic="light"
              style={styles.backButton}
            >
              Voltar
            </HapticButton>
          ) : logo ? (
            <TouchableOpacity
              onPress={handleLogoPress}
              style={styles.logoContainer}
              activeOpacity={0.8}
            >
              <Animated.View entering={FadeIn.duration(400)}>
                <Image
                  source={logo}
                  style={[styles.logo, isScrolled && styles.logoSmall]}
                  resizeMode="contain"
                />
              </Animated.View>
            </TouchableOpacity>
          ) : null}
        </View>

        {title && (
          <View style={styles.centerSection}>
            <Animated.Text
              entering={FadeIn.duration(300)}
              style={[styles.title, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
          </View>
        )}

        <View style={styles.rightSection}>
          {rightIcon && onRightIconPress && (
            <HapticButton
              variant="ghost"
              size="small"
              icon={rightIcon}
              onPress={onRightIconPress}
              haptic="light"
              style={styles.iconButton}
            >
              {''}
            </HapticButton>
          )}

          {showNotifications && (
            <TouchableOpacity
              onPress={handleNotificationsPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: `${theme.colors.primary}10` }]}>
                <Icon name="bell-outline" size={22} color={theme.colors.primary as string} />
              </View>
              {unreadCount > 0 && (
                <Animated.View
                  entering={FadeIn.springify()}
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: theme.colors.secondary as string }
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount.toString()}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          )}

          {showAvatar && (
            <TouchableOpacity
              onPress={handleAvatarPress}
              style={styles.avatarButton}
              activeOpacity={0.8}
            >
              {renderAvatar()}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  backButton: {
    paddingHorizontal: 8,
  },
  logoContainer: {
    paddingVertical: 4,
  },
  logo: {
    width: 140,
    height: 40,
  },
  logoSmall: {
    width: 120,
    height: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarButton: {
    padding: 4,
    marginLeft: 4,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

export default Header;
