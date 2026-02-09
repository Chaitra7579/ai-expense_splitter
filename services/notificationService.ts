
/**
 * Service for handling browser notifications and local scheduling.
 */

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const showLocalNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: 'https://picsum.photos/seed/splitbhai/100/100',
      badge: 'https://picsum.photos/seed/splitbhai/100/100',
      ...options
    });
  }
  return null;
};

export const getNotificationPermissionStatus = (): NotificationPermission => {
  return Notification.permission;
};
