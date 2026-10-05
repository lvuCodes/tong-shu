// Tong Shu. Copyright (C) 2026 lvuCodes. Licensed under GPL-3.0-or-later; see LICENSE.

import { useEffect, useState } from "react";
import { loadManifest, type Manifest } from "./snapshots";

export function useManifest(): Manifest | null | undefined {
  const [manifest, setManifest] = useState<Manifest | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadManifest().then(
      (m) => live && setManifest(m),
      () => live && setManifest(null),
    );
    return () => {
      live = false;
    };
  }, []);
  return manifest;
}
