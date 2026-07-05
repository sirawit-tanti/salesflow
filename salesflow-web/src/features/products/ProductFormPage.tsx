import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { createProductApi, getProductApi, updateProductApi } from "./productApi";
import type { ProductPayload, ProductType } from "./productTypes";

interface ProductFormState { 
    name: string;
    type: ProductType;
    description: string;
    unit: string;
    price: string;
    is_active: boolean;
}

const initialFormState: ProductFormState = {
    name: '',
    type: 'PRODUCT',
    description: '',
    unit: 'pcs',
    price: '',
    is_active: true,
}

function emptyStringToNull(value: string): string | null {
    const trimmedValue = value.trim();

    return trimmedValue === '' ? null : trimmedValue;
}

function buildPayload(form: ProductFormState): ProductPayload {
    return {
        name: form.name.trim(),
        type: form.type,
        description: emptyStringToNull(form.description),
        unit: form.unit.trim(),
        price: Number(form.price || 0),
        is_active: form.is_active,
    };
}

export function ProductFormPage() {
    const navigate = useNavigate();
    const { productId } = useParams();

    const isEditMode = Boolean(productId);

    const [form, setForm] = useState<ProductFormState>(initialFormState);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!productId) {
            return;
        }

        const fetchProducts = async () => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const response = await getProductApi(Number(productId));
                const product = response.data.product;

                setForm({
                    name: product.name,
                    type: product.type,
                    description: product.description ?? '',
                    unit: product.unit,
                    price: product.price,
                    is_active: product.is_active,
                });
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(
                        error.response?.data?.message ?? 'Failed to load product.',
                    );
                } else {
                    setErrorMessage('Failed to delete product.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        void fetchProducts();
    }, [productId]);

    const updateField = (field: keyof ProductFormState, value: string | boolean,) => {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Loading product...</p>
            </div>
        );
    }

    return (
    <div>
      <div className="mb-6">
        <Link
          to="/products"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to products
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {isEditMode ? 'Edit Product / Service' : 'Add Product / Service'}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? 'Update product or service information.'
            : 'Create a new product or service for quotation items.'}
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

            if (isEditMode && productId) {
              await updateProductApi(Number(productId), payload);
            } else {
              await createProductApi(payload);
            }

            navigate('/products');
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const validationErrors = error.response?.data?.errors as
                | Record<string, string[]>
                | undefined;

              if (validationErrors) {
                const firstError = Object.values(validationErrors).flat()[0];

                setErrorMessage(firstError ?? 'Validation failed.');
              } else {
                setErrorMessage(
                  error.response?.data?.message ?? 'Failed to save product.',
                );
              }
            } else {
              setErrorMessage('Failed to save product.');
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
              Name <span className="text-red-500">*</span>
            </label>

            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="Website Development Package"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Type <span className="text-red-500">*</span>
            </label>

            <select
              id="type"
              value={form.type}
              onChange={(event) =>
                updateField('type', event.target.value as ProductType)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              <option value="PRODUCT">Product</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="unit"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Unit <span className="text-red-500">*</span>
            </label>

            <input
              id="unit"
              type="text"
              value={form.unit}
              onChange={(event) => updateField('unit', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="pcs, project, hour, month"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Price <span className="text-red-500">*</span>
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="35000"
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
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="Description for quotation items..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            to="/products"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save Product / Service'}
          </button>
        </div>
      </form>
    </div>
  );
}
