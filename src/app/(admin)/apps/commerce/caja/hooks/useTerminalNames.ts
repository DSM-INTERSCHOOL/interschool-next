import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { getTerminals } from "@/services/terminal.service";

// Fetched once per screen -- lets the Caja/Historial screens show a
// terminal's registered friendly name instead of its raw device_id.
// Falls back to the device_id itself when it isn't registered (see
// apps/commerce/caja/terminales) or the fetch fails.
export const useTerminalNames = () => {
  const [namesByDeviceId, setNamesByDeviceId] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getTerminals({ schoolId })
      .then((terminals) => setNamesByDeviceId(new Map(terminals.map((t) => [t.device_id, t.name]))))
      .catch(() => {
        // Non-critical: screens just fall back to showing the raw device_id.
      });
  }, []);

  const resolveTerminalName = (deviceId: string) => namesByDeviceId.get(deviceId) ?? deviceId;

  return { namesByDeviceId, resolveTerminalName };
};
