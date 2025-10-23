import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const useWelcomeTour = (shouldShow = false) => {
  useEffect(() => {
    if (!shouldShow) return;

    // Detect if mobile view (bottom nav visible)
    const isMobile = window.innerWidth <= 767;

    // Different steps for mobile vs desktop
    const mobileSteps = [
      {
        element: '#app-header',
        popover: {
          title: 'Welcome to The Narrow Trail! 🏔️',
          description: 'Let\'s take a quick tour to help you get started with discovering and joining amazing outdoor adventures.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.mobile-bottom-nav',
        popover: {
          title: 'Mobile Navigation 📱',
          description: 'Use the bottom navigation bar to quickly access all main sections of the portal. Tap any icon to navigate.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.mobile-bottom-nav-item:nth-child(1)',
        popover: {
          title: 'Browse Events 📅',
          description: 'Explore all upcoming events including hiking, camping, cycling, 4x4 trips, and more outdoor activities.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.mobile-bottom-nav-item:nth-child(2)',
        popover: {
          title: 'Calendar View 📆',
          description: 'See all events in a visual calendar format. Spot event types and status at a glance with fun emojis!',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.mobile-bottom-nav-item:nth-child(3)',
        popover: {
          title: 'My Events 🎯',
          description: 'Track events you\'re interested in, confirmed for, or have attended. This is your personal event dashboard.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.mobile-bottom-nav-item:nth-child(5)',
        popover: {
          title: 'Your Profile 👤',
          description: 'Access your profile, view your stats, earn achievement badges, and customize preferences.',
          side: 'top',
          align: 'end'
        }
      },
      {
        popover: {
          title: 'Mobile Tips 💡',
          description: 'Swipe on photo galleries, pull down to refresh event lists, and tap & hold for quick actions. Happy adventuring!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const desktopSteps = [
      {
        element: '#app-header',
        popover: {
          title: 'Welcome to The Narrow Trail! 🏔️',
          description: 'Let\'s take a quick tour to help you get started with discovering and joining amazing outdoor adventures.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '[href="/hikes"]',
        popover: {
          title: 'Browse Events 📅',
          description: 'Explore all upcoming events including hiking, camping, cycling, 4x4 trips, and more outdoor activities.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[href="/my-hikes"]',
        popover: {
          title: 'My Events 🎯',
          description: 'Track events you\'re interested in, confirmed for, or have attended. This is your personal event dashboard.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[href="/calendar"]',
        popover: {
          title: 'Calendar View 📆',
          description: 'See all events in a visual calendar format. Spot event types and status at a glance with fun emojis!',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#user-profile-button',
        popover: {
          title: 'Your Profile 👤',
          description: 'Click here to access your profile, view your stats, earn achievement badges, customize preferences, and manage your account settings.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        popover: {
          title: 'Ready to Start? 🚀',
          description: 'That\'s it! Start by browsing events and expressing interest. When you confirm attendance, you\'ll unlock features like carpool coordination, packing lists, and event comments. Happy adventuring!',
          side: 'center',
          align: 'center'
        }
      }
    ];

    const driverObj = driver({
      showProgress: true,
      steps: isMobile ? mobileSteps : desktopSteps,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Get Started! 🎉',
      onDestroyStarted: () => {
        // Mark tour as completed in localStorage
        localStorage.setItem('welcome_tour_completed', 'true');
        localStorage.setItem('welcome_tour_completed_date', new Date().toISOString());
        driverObj.destroy();
      }
    });

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      driverObj.drive();
    }, 500);

    return () => {
      if (driverObj) {
        driverObj.destroy();
      }
    };
  }, [shouldShow]);
};

export default useWelcomeTour;
