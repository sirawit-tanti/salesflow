import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getCustomersApi } from "../customers/customerApi";
import type { Customer } from "../customers/customerTypes";
import { getProductsApi } from "../products/productApi";
import type { Product } from "../products/productTypes";
import {
  createQuotationApi,
  getQuotationApi,
  updateQuotationApi,
} from "./quotationApi";
import type { QuotationItemPayload, QuotationPayload } from "./quotationTypes";

interface QuotationItemFormState {
  product_id: string;
  item_name: string;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  discount_amount: string;
}

interface QuotationFormState {
  customer_id: string;
  issue_date: string;
  expiry_date: string;
  discount_amount: string;
  tax_rate: string;
  notes: string;
  terms: string;
  items: QuotationItemFormState[];
}

interface QuotationTotals {
  subTotal: number;
  documentDiscountAmount: number;
  taxBase: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyStringToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue === "" ? null : trimmedValue;
}

function createEmptyItem(): QuotationItemFormState {
  return {
    product_id: "",
    item_name: "",
    description: "",
    quantity: "1",
    unit: "pcs",
    unit_price: "0",
    discount_amount: "0",
  };
}

const initialFormState: QuotationFormState = {
  customer_id: "",
  issue_date: todayDateString(),
  expiry_date: "",
  discount_amount: "0",
  tax_rate: "7",
  notes: "",
  terms: "Payment due within 30 days after invoice date.",
  items: [createEmptyItem()],
};

function toNumber(value: string): number {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return numberValue;
}

function calculateLineTotal(item: QuotationItemFormState): number {
  const quantity = toNumber(item.quantity);
  const unitPrice = toNumber(item.unit_price);
  const discountAmount = toNumber(item.discount_amount);

  return Math.max(quantity * unitPrice - discountAmount, 0);
}

function calculateTotals(form: QuotationFormState): QuotationTotals {
  const subTotal = form.items.reduce((total, item) => {
    return total + calculateLineTotal(item);
  }, 0);

  const documentDiscountAmount = Math.min(
    toNumber(form.discount_amount),
    subTotal,
  );

  const taxBase = Math.max(subTotal - documentDiscountAmount, 0);
  const taxRate = toNumber(form.tax_rate);
  const taxAmount = taxBase * (taxRate / 100);
  const totalAmount = taxBase + taxAmount;

  return {
    subTotal,
    documentDiscountAmount,
    taxBase,
    taxRate,
    taxAmount,
    totalAmount,
  };
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildPayload(form: QuotationFormState): QuotationPayload {
  const items: QuotationItemPayload[] = form.items.map((item) => ({
    product_id: item.product_id ? Number(item.product_id) : null,
    item_name: item.item_name.trim(),
    description: emptyStringToNull(item.description),
    quantity: toNumber(item.quantity),
    unit: item.unit.trim(),
    unit_price: toNumber(item.unit_price),
    discount_amount: toNumber(item.discount_amount),
  }));

  return {
    customer_id: Number(form.customer_id),
    issue_date: form.issue_date,
    expiry_date: emptyStringToNull(form.expiry_date),
    discount_amount: toNumber(form.discount_amount),
    tax_rate: toNumber(form.tax_rate),
    notes: emptyStringToNull(form.notes),
    terms: emptyStringToNull(form.terms),
    items,
  };
}

export function QuotationFormPage() {
  const navigate = useNavigate();
  const { quotationId } = useParams();

  const isEditMode = Boolean(quotationId);

  const [form, setForm] = useState<QuotationFormState>(initialFormState);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totals = useMemo(() => calculateTotals(form), [form]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          getCustomersApi({
            per_page: 50,
            is_active: true,
          }),
          getProductsApi({
            per_page: 50,
            is_active: true,
          }),
        ]);

        setCustomers(customersResponse.data.data);
        setProducts(productsResponse.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? "Failed to load master data.",
          );
        } else {
          setErrorMessage("Failed to load master data.");
        }
      }
    };

    void fetchMasterData();
  }, []);

  useEffect(() => {
    if (!quotationId) {
      return;
    }

    const fetchQuotation = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getQuotationApi(Number(quotationId));
        const quotation = response.data.quotation;

        if (quotation.status !== "DRAFT") {
          setErrorMessage("Only draft quotations can be edited.");
        }

        setForm({
          customer_id: String(quotation.customer_id),
          issue_date: quotation.issue_date,
          expiry_date: quotation.expiry_date ?? "",
          discount_amount: quotation.discount_amount,
          tax_rate: quotation.tax_rate,
          notes: quotation.notes ?? "",
          terms: quotation.terms ?? "",
          items:
            quotation.items && quotation.items.length > 0
              ? quotation.items.map((item) => ({
                  product_id: item.product_id ? String(item.product_id) : "",
                  item_name: item.item_name,
                  description: item.description ?? "",
                  quantity: item.quantity,
                  unit: item.unit,
                  unit_price: item.unit_price,
                  discount_amount: item.discount_amount,
                }))
              : [createEmptyItem()],
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? "Failed to load quotation.",
          );
        } else {
          setErrorMessage("Failed to load quotation.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchQuotation();
  }, [quotationId]);

  const updateField = (
    field: keyof Omit<QuotationFormState, "items">,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateItemField = (
    index: number,
    field: keyof QuotationItemFormState,
    value: string,
  ) => {
    setForm((currentForm) => {
      const nextItems = [...currentForm.items];

      nextItems[index] = {
        ...nextItems[index],
        [field]: value,
      };

      return {
        ...currentForm,
        items: nextItems,
      };
    });
  };

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find(
      (product) => String(product.id) === productId,
    );

    setForm((currentForm) => {
      const nextItems = [...currentForm.items];

      nextItems[index] = {
        ...nextItems[index],
        product_id: productId,
        item_name: selectedProduct?.name ?? nextItems[index].item_name,
        description:
          selectedProduct?.description ?? nextItems[index].description,
        unit: selectedProduct?.unit ?? nextItems[index].unit,
        unit_price: selectedProduct?.price ?? nextItems[index].unit_price,
      };

      return {
        ...currentForm,
        items: nextItems,
      };
    });
  };

  const addItem = () => {
    setForm((currentForm) => ({
      ...currentForm,
      items: [...currentForm.items, createEmptyItem()],
    }));
  };

  const removeItem = (index: number) => {
    setForm((currentForm) => {
      if (currentForm.items.length === 1) {
        return currentForm;
      }

      return {
        ...currentForm,
        items: currentForm.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading quotation...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/quotations"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to quotations
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Quotation" : "Create Quotation"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a draft quotation with customer and item details.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          setErrorMessage("");
          setIsSubmitting(true);

          try {
            const payload = buildPayload(form);

            const response =
              isEditMode && quotationId
                ? await updateQuotationApi(Number(quotationId), payload)
                : await createQuotationApi(payload);

            navigate(`/quotations/${response.data.quotation.id}`);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const validationErrors = error.response?.data?.errors as
                | Record<string, string[]>
                | undefined;

              if (validationErrors) {
                const firstError = Object.values(validationErrors).flat()[0];

                setErrorMessage(firstError ?? "Validation failed.");
              } else {
                setErrorMessage(
                  error.response?.data?.message ?? "Failed to save quotation.",
                );
              }
            } else {
              setErrorMessage("Failed to save quotation.");
            }
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="space-y-6"
      >
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Quotation Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="customer_id"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Customer <span className="text-red-500">*</span>
              </label>

              <select
                id="customer_id"
                value={form.customer_id}
                onChange={(event) =>
                  updateField("customer_id", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_code} - {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="issue_date"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Issue Date <span className="text-red-500">*</span>
              </label>

              <input
                id="issue_date"
                type="date"
                value={form.issue_date}
                onChange={(event) =>
                  updateField("issue_date", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="expiry_date"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Expiry Date
              </label>

              <input
                id="expiry_date"
                type="date"
                value={form.expiry_date}
                onChange={(event) =>
                  updateField("expiry_date", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="tax_rate"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                VAT Rate (%)
              </label>

              <input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.tax_rate}
                onChange={(event) =>
                  updateField("tax_rate", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add products, services, or manual items.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-4 p-6">
            {form.items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Item #{index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="xl:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Product / Service
                    </label>

                    <select
                      value={item.product_id}
                      onChange={(event) =>
                        handleProductChange(index, event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                    >
                      <option value="">Manual item</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.product_code} - {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="xl:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Item Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(event) =>
                        updateItemField(index, "item_name", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                      placeholder="Website Development Package"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Quantity <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItemField(index, "quantity", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Unit <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={item.unit}
                      onChange={(event) =>
                        updateItemField(index, "unit", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                      placeholder="pcs, project, month"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Unit Price <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(event) =>
                        updateItemField(index, "unit_price", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Item Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount_amount}
                      onChange={(event) =>
                        updateItemField(
                          index,
                          "discount_amount",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="xl:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Description
                    </label>

                    <textarea
                      value={item.description}
                      onChange={(event) =>
                        updateItemField(
                          index,
                          "description",
                          event.target.value,
                        )
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Line Total
                    </label>

                    <div className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900">
                      {formatMoney(calculateLineTotal(item))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Notes & Terms
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                  placeholder="Thank you for your business."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Terms
                </label>

                <textarea
                  value={form.terms}
                  onChange={(event) => updateField("terms", event.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                  placeholder="Payment terms..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Document Discount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_amount}
                  onChange={(event) =>
                    updateField("discount_amount", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-medium text-slate-900">
                    {formatMoney(totals.subTotal)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-500">Discount</dt>
                  <dd className="font-medium text-slate-900">
                    {formatMoney(totals.documentDiscountAmount)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-500">Tax Base</dt>
                  <dd className="font-medium text-slate-900">
                    {formatMoney(totals.taxBase)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-500">VAT {totals.taxRate}%</dt>
                  <dd className="font-medium text-slate-900">
                    {formatMoney(totals.taxAmount)}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                  <dt className="font-semibold text-slate-900">Total</dt>
                  <dd className="font-bold text-slate-900">
                    {formatMoney(totals.totalAmount)}
                  </dd>
                </div>
              </dl>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Link
                  to="/quotations"
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
