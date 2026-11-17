import commerceApi from "./commerceApi";
import {
  AccountStatement,
  DevolverPedidosRequest,
  FacturarRequest,
  PendingPaymentRead,
  RealizarCambiosRequest,
  RealizarPagoRequest,
  RecargaSpeiInstructions,
  RecargarSaldoRequest,
  SolicitarRecargaSpeiRequest,
  TransactionResult,
  WalletStatement,
  WalletTopupStatus,
} from "@/interfaces/ITransaction";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const realizarPago = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: RealizarPagoRequest }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(
    `/schools/${schoolId}/transactions/realizar-pago`,
    dto
  );
  return response.data;
};

// Backend rejects anything but an already-paid, not-yet-invoiced order.
export const facturarOrder = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: FacturarRequest }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(`/schools/${schoolId}/transactions/facturar`, dto);
  return response.data;
};

export const recargarSaldo = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: RecargarSaldoRequest }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(`/schools/${schoolId}/transactions/wallet/topup`, dto);
  return response.data;
};

// Self-service: the logged-in person asks to top up their own wallet via
// SPEI. Creates a PENDING top-up and returns where to deposit.
export const solicitarRecargaSpei = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: SolicitarRecargaSpeiRequest }): Promise<RecargaSpeiInstructions> => {
  const response = await commerceApi.post<RecargaSpeiInstructions>(
    `/schools/${schoolId}/transactions/wallet/topup/spei`,
    dto
  );
  return response.data;
};

// Whether the logged-in person can top up via SPEI: channel enabled and a
// CLABE to deposit to (the school's CLABE única, or their own CLABE).
export const getRecargaSpeiDisponible = async ({ schoolId }: ServiceArgs): Promise<boolean> => {
  const response = await commerceApi.get<{ available: boolean }>(
    `/schools/${schoolId}/transactions/wallet/topup/spei/disponible`
  );
  return response.data.available;
};

// The logged-in person's own SPEI top-ups still awaiting confirmation.
export const getMisRecargasSpei = async ({ schoolId }: ServiceArgs): Promise<RecargaSpeiInstructions[]> => {
  const response = await commerceApi.get<RecargaSpeiInstructions[]>(
    `/schools/${schoolId}/transactions/wallet/topup/spei`
  );
  return response.data;
};

export const getAccountStatement = async ({
  schoolId,
  personInternalId,
  start,
  end,
}: ServiceArgs & { personInternalId: string; start?: string; end?: string }): Promise<AccountStatement> => {
  const response = await commerceApi.get<AccountStatement>(
    `/schools/${schoolId}/transactions/account/${encodeURIComponent(personInternalId)}/statement`,
    { params: { start, end } }
  );
  return response.data;
};

export const getWalletStatement = async ({
  schoolId,
  personInternalId,
  start,
  end,
}: ServiceArgs & { personInternalId: string; start?: string; end?: string }): Promise<WalletStatement> => {
  const response = await commerceApi.get<WalletStatement>(
    `/schools/${schoolId}/transactions/wallet/${encodeURIComponent(personInternalId)}/statement`,
    { params: { start, end } }
  );
  return response.data;
};

// Lists whatever's awaiting SPEI reconciliation -- a wallet recharge
// (purpose="WALLET_TOPUP") or an order placed via the SPEI checkout vía
// (purpose="ORDER"), same queue, same confirm/cancel actions for either.
export const getPendingPayments = async ({
  schoolId,
  purpose,
  status,
  personInternalId,
}: ServiceArgs & {
  purpose?: "WALLET_TOPUP" | "ORDER";
  status?: WalletTopupStatus;
  personInternalId?: string;
}): Promise<PendingPaymentRead[]> => {
  const params = new URLSearchParams();
  if (purpose) params.append("purpose", purpose);
  if (status) params.append("status", status);
  if (personInternalId) params.append("person_internal_id", personInternalId);
  const response = await commerceApi.get<PendingPaymentRead[]>(
    `/schools/${schoolId}/transactions/pending-payments?${params.toString()}`
  );
  return response.data;
};

export const confirmarPagoPendiente = async ({
  schoolId,
  orderPaymentId,
}: ServiceArgs & { orderPaymentId: number }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(
    `/schools/${schoolId}/transactions/pending-payments/${orderPaymentId}/confirm`
  );
  return response.data;
};

export const cancelarPagoPendiente = async ({
  schoolId,
  orderPaymentId,
}: ServiceArgs & { orderPaymentId: number }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(
    `/schools/${schoolId}/transactions/pending-payments/${orderPaymentId}/cancel`
  );
  return response.data;
};

// Returns inventory for each line (only what's actually been dispatched
// and not already returned). Only a paid order can be returned.
export const devolverPedidos = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: DevolverPedidosRequest }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(
    `/schools/${schoolId}/transactions/devolver-pedidos`,
    dto
  );
  return response.data;
};

// Returns returned_lines' inventory and delivers delivered_lines'
// inventory. If the new article(s) cost more, `payments` charges the
// difference (new order); if less, `refund` credits it back. Only a paid
// order can be exchanged.
export const realizarCambios = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: RealizarCambiosRequest }): Promise<TransactionResult> => {
  const response = await commerceApi.post<TransactionResult>(
    `/schools/${schoolId}/transactions/realizar-cambios`,
    dto
  );
  return response.data;
};
