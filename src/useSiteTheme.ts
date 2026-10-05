// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useEffect, useState } from "react";
import { applyTheme, isThemeId, type ThemeId } from "@lvucodes/ui";

export const SITE_THEME_KEY = "tong-shu:theme";
export const SITE_DEFAULT_THEME: ThemeId = "basic";

export function loadSiteTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(SITE_THEME_KEY);
    return isThemeId(stored) ? stored : SITE_DEFAULT_THEME;
  } catch {
    return SITE_DEFAULT_THEME;
  }
}

export function useSiteTheme(): [ThemeId, (theme: ThemeId) => void] {
  const [theme, setTheme] = useState(loadSiteTheme);
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(SITE_THEME_KEY, theme);
    } catch {
      // Storage blocked: the theme lasts for this page session only.
    }
  }, [theme]);
  return [theme, setTheme];
}
