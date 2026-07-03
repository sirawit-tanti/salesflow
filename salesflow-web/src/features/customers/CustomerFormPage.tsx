import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { createCustomerApi, getCustomerApi, updateCustomerApi } from "./customerApi";
import type { CustomerPayload } from "./customerTypes";

interface CustomerFormState {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    tax_id: string;
    address: string;
    contact_name: string;
    contact_phone: string;
    is_active: boolean;
}

const initialFormState: CustomerFormState = {
    name: '',
    company_name: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    contact_name: '',
    contact_phone: '',
    is_active: true,
}

function emptyStringToNull(value: string): string | null {
    const trimmedValue = value.trim();

    return trimmedValue === '' ? null : trimmedValue;
}

function buildPayload(form: CustomerFormState): CustomerPayload {
    return {
        name: form.name.trim(),
        company_name: emptyStringToNull(form.company_name),
        email: emptyStringToNull(form.email),
        phone: emptyStringToNull(form.phone),
        tax_id: emptyStringToNull(form.tax_id),
        address: emptyStringToNull(form.address),
        contact_name: emptyStringToNull(form.contact_name),
        contact_phone: emptyStringToNull(form.contact_phone),
        is_active: form.is_active,
    };
}

export function CustomerFormPage() {
    const navigate = useNavigate();
    const { customerId } = useParams();

    const isEditMode = Boolean(customerId);

    const [form, setForm] = useState<CustomerFormState>(initialFormState);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!customerId) {
            return;
        }

        const fetchCustomer = async () => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const response = await getCustomerApi(Number(customerId));
                const customer = response.data.customer;

                setForm({
                    name: customer.name,
                    company_name: customer.company_name ?? '',
                    email: customer.email ?? '',
                    phone: customer.phone ?? '',
                    tax_id: customer.tax_id ?? '',
                    address: customer.address ?? '',
                    contact_name: customer.contact_name ?? '',
                    contact_phone: customer.contact_phone ?? '',
                    is_active: customer.is_active,
                });
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(
                        error.response?.data?.message ?? 'Failed to load customer.',
                    );
                } else {
                    setErrorMessage('Failed to load customer.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        void fetchCustomer();
    }, [customerId]);

    const updateField = (
        field: keyof CustomerFormState,
        value: string | boolean,
    ) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Loading customer...</p>
            </div>
        );
    }

    return (
    <div>
      <div className="mb-6">
        <Link
          to="/customers"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to customers
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {isEditMode ? 'Edit Customer' : 'Add Customer'}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? 'Update customer information.'
            : 'Create a new customer record for future quotations and invoices.'}
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

          setErrorMessage('');
          setIsSubmitting(true);

          try {
            const payload = buildPayload(form);

            if (isEditMode && customerId) {
              await updateCustomerApi(Number(customerId), payload);
            } else {
              await createCustomerApi(payload);
            }

            navigate('/customers');
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const validationErrors = error.response?.data?.errors;

              if (validationErrors) {
                const firstError = Object.values(validationErrors)
                  .flat()
                  .at(0);

                setErrorMessage(String(firstError));
              } else {
                setErrorMessage(
                  error.response?.data?.message ?? 'Failed to save customer.',
                );
              }
            } else {
              setErrorMessage('Failed to save customer.');
            }
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="rounded-xl bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Customer Name <span className="text-red-500">*</span>
            </label>

            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="ABC Trading Co., Ltd."
            />
          </div>

          <div>
            <label
              htmlFor="company_name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Company Name
            </label>

            <input
              id="company_name"
              type="text"
              value={form.company_name}
              onChange={(event) =>
                updateField('company_name', event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="ABC Trading Co., Ltd."
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="contact@abc.test"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Phone
            </label>

            <input
              id="phone"
              type="text"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="020000001"
            />
          </div>

          <div>
            <label
              htmlFor="tax_id"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Tax ID
            </label>

            <input
              id="tax_id"
              type="text"
              value={form.tax_id}
              onChange={(event) => updateField('tax_id', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="0105566000001"
            />
          </div>

          <div>
            <label
              htmlFor="contact_name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Contact Name
            </label>

            <input
              id="contact_name"
              type="text"
              value={form.contact_name}
              onChange={(event) =>
                updateField('contact_name', event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="Mr. Somchai"
            />
          </div>

          <div>
            <label
              htmlFor="contact_phone"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Contact Phone
            </label>

            <input
              id="contact_phone"
              type="text"
              value={form.contact_phone}
              onChange={(event) =>
                updateField('contact_phone', event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="0810000001"
            />
          </div>

          <div>
            <label
              htmlFor="is_active"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="is_active"
              value={form.is_active ? '1' : '0'}
              onChange={(event) =>
                updateField('is_active', event.target.value === '1')
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Address
            </label>

            <textarea
              id="address"
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="Bangkok, Thailand"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            to="/customers"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}