import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';

/**
 * useNavLoading Hook
 * Manages loading animations and data synchronization when user clicks "Back" or "Home".
 */
export function useNavLoading() {
  const navigate = useNavigate();
  const { navLoading, setNavLoading } = useAuction();

  const goBack = useCallback((
    title = 'SAVING & RETURNING...',
    subtitle = 'Saving your session data & returning to previous screen...',
    onBeforeNavigate = null
  ) => {
    if (navLoading?.active) return;
    if (typeof onBeforeNavigate === 'function') {
      try {
        onBeforeNavigate();
      } catch (e) {
        console.warn('Navigation cleanup error:', e);
      }
    }
    setNavLoading({
      active: true,
      title,
      subtitle,
    });
    setTimeout(() => {
      navigate(-1);
      setTimeout(() => {
        setNavLoading({ active: false, title: '', subtitle: '' });
      }, 250);
    }, 400);
  }, [navLoading, setNavLoading, navigate]);

  const goHome = useCallback((
    target = '/play-options',
    title = 'RETURNING TO MENU...',
    subtitle = 'Saving progress & returning to the main menu...',
    onBeforeNavigate = null
  ) => {
    if (navLoading?.active) return;
    if (typeof onBeforeNavigate === 'function') {
      try {
        onBeforeNavigate();
      } catch (e) {
        console.warn('Navigation cleanup error:', e);
      }
    }
    setNavLoading({
      active: true,
      title,
      subtitle,
    });
    setTimeout(() => {
      navigate(target, { replace: true });
      setTimeout(() => {
        setNavLoading({ active: false, title: '', subtitle: '' });
      }, 250);
    }, 400);
  }, [navLoading, setNavLoading, navigate]);

  return { goBack, goHome, navLoading };
}
