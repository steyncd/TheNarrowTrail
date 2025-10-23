import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Hook for showing a tour on the event detail page (first visit only)
 * @param {boolean} shouldShow - Whether to show the tour
 * @param {Object} eventData - Event data to customize tour
 */
const useEventDetailTour = (shouldShow = false, eventData = {}) => {
  useEffect(() => {
    if (!shouldShow) return;

    // Check if user has seen this tour before
    const tourCompleted = localStorage.getItem('event_detail_tour_completed');
    if (tourCompleted) return;

    const isMobile = window.innerWidth <= 767;

    const tourSteps = [
      {
        popover: {
          title: 'Welcome to Event Details! 🏔️',
          description: 'This tour will show you the key features of an event page. Let\'s get started!',
          side: 'center',
          align: 'center'
        }
      },
      {
        element: '[data-tour="event-tags"]',
        popover: {
          title: 'Event Tags 🏷️',
          description: 'These badges show the event type, difficulty level, duration, and special features at a glance.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="event-description"]',
        popover: {
          title: 'Full Description 📝',
          description: 'Read the complete event details, what to expect, and what\'s included.',
          side: isMobile ? 'top' : 'left',
          align: 'start'
        }
      },
      {
        element: '[data-tour="participant-count"]',
        popover: {
          title: 'Participants 👥',
          description: 'See who else is interested or confirmed. The more people join, the more likely it is to happen!',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '[data-tour="interest-button"]',
        popover: {
          title: 'Express Interest 💚',
          description: 'Click here to show you\'re interested! You\'ll get notifications about updates and deadlines.',
          side: isMobile ? 'top' : 'bottom',
          align: 'center'
        }
      }
    ];

    // Add mobile-specific steps
    if (isMobile) {
      tourSteps.push({
        popover: {
          title: 'Mobile Tips 💡',
          description: 'Scroll down to see photos, comments, carpool options, and more. Use the sticky button at the bottom to quickly express interest or confirm attendance.',
          side: 'center',
          align: 'center'
        }
      });
    } else {
      tourSteps.push({
        popover: {
          title: 'Explore More 🔍',
          description: 'Scroll down to see photos, comments, packing list, carpool coordination, and more features. Once you confirm attendance, you\'ll unlock additional collaboration tools!',
          side: 'center',
          align: 'center'
        }
      });
    }

    const driverObj = driver({
      showProgress: true,
      steps: tourSteps,
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Got it! 🎉',
      allowClose: true,
      overlayClickNext: false,
      smoothScroll: true,
      onDestroyStarted: () => {
        // Mark tour as completed
        localStorage.setItem('event_detail_tour_completed', 'true');
        localStorage.setItem('event_detail_tour_completed_date', new Date().toISOString());
        driverObj.destroy();
      },
      onNextClick: (element, step, options) => {
        // Move to next step even if element is not found
        driverObj.moveNext();
      },
      onPrevClick: (element, step, options) => {
        // Move to previous step even if element is not found
        driverObj.movePrevious();
      }
    });

    // Delay to ensure page is fully loaded
    setTimeout(() => {
      try {
        driverObj.drive();
      } catch (error) {
        console.warn('Event detail tour failed to start:', error);
        // Still mark as completed to avoid showing broken tour again
        localStorage.setItem('event_detail_tour_completed', 'true');
      }
    }, 1500); // Increased delay for mobile

    return () => {
      if (driverObj) {
        driverObj.destroy();
      }
    };
  }, [shouldShow, eventData]);
};

export default useEventDetailTour;
