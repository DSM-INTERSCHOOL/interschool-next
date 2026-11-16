const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export const formatCurrency = (value: number | string) => formatter.format(Number(value));
