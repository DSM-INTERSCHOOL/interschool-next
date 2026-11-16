import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ConfigurablePaymentMethod } from "@/interfaces/IPaymentMethodConfig";
import { ConfigurablePaymentChannel } from "@/interfaces/IPaymentChannelConfig";
import { SpeiMode } from "@/interfaces/ICommerceConfig";
import { WarehouseRead } from "@/interfaces/IWarehouse";
import { getPaymentMethodConfig, setPaymentMethodConfig } from "@/services/paymentMethodConfig.service";
import { getPaymentChannelConfig, setPaymentChannelConfig } from "@/services/paymentChannelConfig.service";
import { getCommerceConfig, updateCommerceConfig } from "@/services/commerceConfig.service";
import { getWarehouses } from "@/services/warehouse.service";

export const useConfiguracionForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [warehouses, setWarehouses] = useState<WarehouseRead[]>([]);

  const [enabledMethods, setEnabledMethods] = useState<Set<ConfigurablePaymentMethod>>(new Set());
  const [paymentSaveLoading, setPaymentSaveLoading] = useState(false);
  const [paymentSaveError, setPaymentSaveError] = useState<string | null>(null);
  const [paymentSaved, setPaymentSaved] = useState(false);

  const [enabledChannels, setEnabledChannels] = useState<Set<ConfigurablePaymentChannel>>(new Set());
  const [channelSaveLoading, setChannelSaveLoading] = useState(false);
  const [channelSaveError, setChannelSaveError] = useState<string | null>(null);
  const [channelSaved, setChannelSaved] = useState(false);

  const [selfServiceWarehouseId, setSelfServiceWarehouseId] = useState<number | "">("");
  const [operatorWarehouseId, setOperatorWarehouseId] = useState<number | "">("");
  const [warehouseSaveLoading, setWarehouseSaveLoading] = useState(false);
  const [warehouseSaveError, setWarehouseSaveError] = useState<string | null>(null);
  const [warehouseSaved, setWarehouseSaved] = useState(false);

  const [speiMode, setSpeiModeState] = useState<SpeiMode>("CLABE_PERSONAL");
  const [accountNumberClabe, setAccountNumberClabe] = useState("");
  const [bankClabe, setBankClabe] = useState("");
  const [ownerNameClabe, setOwnerNameClabe] = useState("");
  const [speiSaveLoading, setSpeiSaveLoading] = useState(false);
  const [speiSaveError, setSpeiSaveError] = useState<string | null>(null);
  const [speiSaved, setSpeiSaved] = useState(false);

  // Shown/edited in hours -- stored as minutes on CommerceConfig
  // .order_auto_cancel_minutes. Backend default is 2880 (48h).
  const [orderAutoCancelHours, setOrderAutoCancelHoursState] = useState(48);
  const [autoCancelSaveLoading, setAutoCancelSaveLoading] = useState(false);
  const [autoCancelSaveError, setAutoCancelSaveError] = useState<string | null>(null);
  const [autoCancelSaved, setAutoCancelSaved] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const [methods, channels, config, warehousesData] = await Promise.all([
        getPaymentMethodConfig({ schoolId }),
        getPaymentChannelConfig({ schoolId }),
        getCommerceConfig({ schoolId }),
        getWarehouses({ schoolId }),
      ]);
      setEnabledMethods(new Set(methods.filter((m) => m.enabled).map((m) => m.payment_method)));
      setEnabledChannels(new Set(channels.filter((c) => c.enabled).map((c) => c.payment_channel)));
      setSelfServiceWarehouseId(config.self_service_warehouse_id ?? "");
      setOperatorWarehouseId(config.operator_warehouse_id ?? "");
      setSpeiModeState(config.spei_mode);
      setAccountNumberClabe(config.account_number_clabe ?? "");
      setBankClabe(config.bank_clabe ?? "");
      setOwnerNameClabe(config.owner_name_clabe ?? "");
      setOrderAutoCancelHoursState(Math.round(config.order_auto_cancel_minutes / 60));
      setWarehouses(warehousesData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleMethod = (method: ConfigurablePaymentMethod) => {
    setPaymentSaved(false);
    setEnabledMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  };

  const savePaymentMethods = async () => {
    if (enabledMethods.size === 0) {
      setPaymentSaveError("Debes dejar al menos una forma de pago habilitada");
      return;
    }
    try {
      setPaymentSaveLoading(true);
      setPaymentSaveError(null);
      const { schoolId } = getOrgConfig();
      const result = await setPaymentMethodConfig({
        schoolId,
        dto: { enabled_payment_methods: Array.from(enabledMethods) },
      });
      setEnabledMethods(new Set(result.filter((m) => m.enabled).map((m) => m.payment_method)));
      setPaymentSaved(true);
    } catch (err: any) {
      setPaymentSaveError(err.response?.data?.detail || err.message || "No se pudieron guardar las formas de pago");
    } finally {
      setPaymentSaveLoading(false);
    }
  };

  const toggleChannel = (channel: ConfigurablePaymentChannel) => {
    setChannelSaved(false);
    setEnabledChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      return next;
    });
  };

  const saveChannels = async () => {
    try {
      setChannelSaveLoading(true);
      setChannelSaveError(null);
      const { schoolId } = getOrgConfig();
      const result = await setPaymentChannelConfig({
        schoolId,
        dto: { enabled_payment_channels: Array.from(enabledChannels) },
      });
      setEnabledChannels(new Set(result.filter((c) => c.enabled).map((c) => c.payment_channel)));
      setChannelSaved(true);
    } catch (err: any) {
      setChannelSaveError(err.response?.data?.detail || err.message || "No se pudieron guardar los medios de pago");
    } finally {
      setChannelSaveLoading(false);
    }
  };

  const saveWarehouses = async () => {
    try {
      setWarehouseSaveLoading(true);
      setWarehouseSaveError(null);
      const { schoolId } = getOrgConfig();
      await updateCommerceConfig({
        schoolId,
        dto: {
          self_service_warehouse_id: selfServiceWarehouseId === "" ? null : selfServiceWarehouseId,
          operator_warehouse_id: operatorWarehouseId === "" ? null : operatorWarehouseId,
        },
      });
      setWarehouseSaved(true);
    } catch (err: any) {
      setWarehouseSaveError(err.response?.data?.detail || err.message || "No se pudo guardar el almacén por defecto");
    } finally {
      setWarehouseSaveLoading(false);
    }
  };

  const saveSpeiConfig = async () => {
    if (speiMode === "CLABE_UNICA" && (!accountNumberClabe.trim() || !bankClabe.trim() || !ownerNameClabe.trim())) {
      setSpeiSaveError("CLABE única requiere cuenta CLABE, banco y titular");
      return;
    }
    try {
      setSpeiSaveLoading(true);
      setSpeiSaveError(null);
      const { schoolId } = getOrgConfig();
      await updateCommerceConfig({
        schoolId,
        dto: {
          spei_mode: speiMode,
          account_number_clabe: speiMode === "CLABE_UNICA" ? accountNumberClabe.trim() : null,
          bank_clabe: speiMode === "CLABE_UNICA" ? bankClabe.trim() : null,
          owner_name_clabe: speiMode === "CLABE_UNICA" ? ownerNameClabe.trim() : null,
        },
      });
      setSpeiSaved(true);
    } catch (err: any) {
      setSpeiSaveError(err.response?.data?.detail || err.message || "No se pudo guardar la configuración de SPEI");
    } finally {
      setSpeiSaveLoading(false);
    }
  };

  const saveAutoCancelConfig = async () => {
    if (orderAutoCancelHours <= 0) {
      setAutoCancelSaveError("Debe ser un número de horas mayor a cero");
      return;
    }
    try {
      setAutoCancelSaveLoading(true);
      setAutoCancelSaveError(null);
      const { schoolId } = getOrgConfig();
      await updateCommerceConfig({
        schoolId,
        dto: { order_auto_cancel_minutes: Math.round(orderAutoCancelHours * 60) },
      });
      setAutoCancelSaved(true);
    } catch (err: any) {
      setAutoCancelSaveError(err.response?.data?.detail || err.message || "No se pudo guardar el tiempo límite");
    } finally {
      setAutoCancelSaveLoading(false);
    }
  };

  return {
    loading,
    error,
    warehouses,
    enabledMethods,
    toggleMethod,
    paymentSaveLoading,
    paymentSaveError,
    paymentSaved,
    savePaymentMethods,
    enabledChannels,
    toggleChannel,
    channelSaveLoading,
    channelSaveError,
    channelSaved,
    saveChannels,
    selfServiceWarehouseId,
    setSelfServiceWarehouseId: (v: number | "") => {
      setWarehouseSaved(false);
      setSelfServiceWarehouseId(v);
    },
    operatorWarehouseId,
    setOperatorWarehouseId: (v: number | "") => {
      setWarehouseSaved(false);
      setOperatorWarehouseId(v);
    },
    warehouseSaveLoading,
    warehouseSaveError,
    warehouseSaved,
    saveWarehouses,
    speiMode,
    setSpeiMode: (v: SpeiMode) => {
      setSpeiSaved(false);
      setSpeiModeState(v);
    },
    accountNumberClabe,
    setAccountNumberClabe: (v: string) => {
      setSpeiSaved(false);
      setAccountNumberClabe(v);
    },
    bankClabe,
    setBankClabe: (v: string) => {
      setSpeiSaved(false);
      setBankClabe(v);
    },
    ownerNameClabe,
    setOwnerNameClabe: (v: string) => {
      setSpeiSaved(false);
      setOwnerNameClabe(v);
    },
    speiSaveLoading,
    speiSaveError,
    speiSaved,
    saveSpeiConfig,
    orderAutoCancelHours,
    setOrderAutoCancelHours: (v: number) => {
      setAutoCancelSaved(false);
      setOrderAutoCancelHoursState(v);
    },
    autoCancelSaveLoading,
    autoCancelSaveError,
    autoCancelSaved,
    saveAutoCancelConfig,
  };
};
