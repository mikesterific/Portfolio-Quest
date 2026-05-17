const TOUCH_PRIMARY = "(hover: none) and (pointer: coarse)";
const HAS_FINE_POINTER = "(any-pointer: fine)";
const COARSE_POINTER = "(any-pointer: coarse)";
const SMALL_SCREEN_MAX_WIDTH = 900;
const SMALL_SCREEN_MAX_HEIGHT = 600;
const MOBILE_OR_TABLET_UA =
  /Android|webOS|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Kindle|Silk|PlayBook/i;
const DESKTOP_OS_UA = /Windows NT|Macintosh|X11|Linux x86_64/i;

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    mobile?: boolean;
  };
}

function isMobileOrTabletUserAgent(): boolean {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;

  const userAgentDataMobile = (navigator as NavigatorWithUserAgentData).userAgentData?.mobile;
  const iPadDesktopMode =
    platform === "MacIntel" && maxTouchPoints > 1 && window.matchMedia(COARSE_POINTER).matches;

  return userAgentDataMobile === true || MOBILE_OR_TABLET_UA.test(ua) || iPadDesktopMode;
}

function isLikelyDesktopWithTouchscreen(): boolean {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  return (
    window.matchMedia(HAS_FINE_POINTER).matches &&
    window.matchMedia("(hover: hover)").matches &&
    (DESKTOP_OS_UA.test(ua) || platform.includes("Win") || platform.includes("Mac"))
  );
}

function hasSmallViewport(): boolean {
  const width = Math.min(window.innerWidth, window.screen?.width || window.innerWidth);
  const height = Math.min(window.innerHeight, window.screen?.height || window.innerHeight);

  return width <= SMALL_SCREEN_MAX_WIDTH || height <= SMALL_SCREEN_MAX_HEIGHT;
}

/**
 * Portfolio Quest relies on precise pointer input and keyboard. Touch-first
 * devices (phones, most tablets without fine pointer) get a blocking screen.
 * Laptops with touchscreens typically report a fine pointer and stay allowed.
 */
export function appRequiresKeyboardMouse(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const touchPrimary = window.matchMedia(TOUCH_PRIMARY).matches;
  const hasFinePointer = window.matchMedia(HAS_FINE_POINTER).matches;
  const touchHardware = navigator.maxTouchPoints > 0;
  const mobileOrTablet = isMobileOrTabletUserAgent();
  const smallTouchViewport = touchHardware && hasSmallViewport();
  const desktopWithTouchscreen = isLikelyDesktopWithTouchscreen();

  if (desktopWithTouchscreen && !mobileOrTablet && !touchPrimary) {
    return false;
  }

  const noFinePointingDevice =
    touchHardware && !hasFinePointer && window.matchMedia("(hover: none)").matches;

  return touchPrimary || noFinePointingDevice || mobileOrTablet || smallTouchViewport;
}

export function subscribeAppInputRequirement(onChange: (blocked: boolean) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let blocked = appRequiresKeyboardMouse();
  onChange(blocked);

  const mqTouch = window.matchMedia(TOUCH_PRIMARY);
  const mqFine = window.matchMedia(HAS_FINE_POINTER);
  const mqHover = window.matchMedia("(hover: none)");
  const mqCoarse = window.matchMedia(COARSE_POINTER);

  const update = (): void => {
    const next = appRequiresKeyboardMouse();
    if (next !== blocked) {
      blocked = next;
      onChange(blocked);
    }
  };

  mqTouch.addEventListener("change", update);
  mqFine.addEventListener("change", update);
  mqHover.addEventListener("change", update);
  mqCoarse.addEventListener("change", update);
  window.addEventListener("resize", update);

  return () => {
    mqTouch.removeEventListener("change", update);
    mqFine.removeEventListener("change", update);
    mqHover.removeEventListener("change", update);
    mqCoarse.removeEventListener("change", update);
    window.removeEventListener("resize", update);
  };
}
