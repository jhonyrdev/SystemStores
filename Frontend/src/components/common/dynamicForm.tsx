import React, { useState, useEffect, type JSX } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineMail as SiMicrosoftoutlook } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getProductoImgUrl } from "@/utils/producto";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "file";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  // Optional validation error message to display under the field
  error?: string;
}

interface DynamicFormProps {
  title?: string;
  fields: FieldConfig[];
  submitLabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: Record<string, any>;
  showPasswordStrength?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeField?: (name: string, value: any) => void;
  onGoogleLogin?: () => void;
  onOutlookLogin?: () => void;
  showSocialButtons?: boolean;
  formError?: string | null;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  fields,
  submitLabel = "Guardar",
  onSubmit,
  initialValues = {},
  showPasswordStrength,
  onChangeField,
  onGoogleLogin,
  onOutlookLogin,
  showSocialButtons,
  formError,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (initialValues.imgProd) {
      setImagenPreview(getProductoImgUrl(initialValues.imgProd));
    } else {
      setImagenPreview(null);
    }
  }, [initialValues]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (onChangeField) onChangeField(name, value);

    if (name === "password") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (onChangeField) onChangeField(name, file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagenPreview(previewUrl);
    } else {
      if (initialValues.imgProd) {
        setImagenPreview(getProductoImgUrl(initialValues.imgProd));
      } else {
        setImagenPreview(null);
      }
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length > 5) score += 25;
    if (password.length > 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9!@#$%^&*]/.test(password)) score += 25;
    return score;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {title && <h2 className="text-xl font-semibold text-center">{title}</h2>}
      <div className="overflow-y-auto overflow-x-hidden max-h-[60vh] md:max-h-[70vh] w-full pr-2">
        <div className="space-y-5">
          {fields.reduce<JSX.Element[]>((acc, field, index, arr) => {
            // Agrupar marca + unidad
            if (field.name === "marca" && arr[index + 1]?.name === "unidad") {
              acc.push(
                <div
                  key="marca-unidad"
                  className="flex flex-col md:flex-row gap-4"
                >
                  {[field, arr[index + 1]].map((f) => (
                    <div key={f.name} className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Input
                        id={f.name}
                        type="text"
                        placeholder={f.placeholder}
                        required={f.required}
                        value={formData[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        disabled={f.disabled}
                        className="w-full"
                      />
                      {f.error && (
                        <p className="text-xs text-red-600 mt-1">{f.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              );
              return acc;
            }

            // Agrupar categoría + subcategoría
            if (
              field.name === "categoria" &&
              arr[index + 1]?.name === "subcategoria"
            ) {
              acc.push(
                <div
                  key="cat-subcat"
                  className="flex flex-col md:flex-row gap-4"
                >
                  {[field, arr[index + 1]].map((f) => (
                    <div key={f.name} className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Select
                        value={formData[f.name] || ""}
                        onValueChange={(val) => handleChange(f.name, val)}
                        disabled={f.disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              f.placeholder || "Selecciona una opción"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {f.options && f.options.length > 0 ? (
                            f.options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-gray-500">
                              No hay opciones disponibles
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              );
              return acc;
            }

            // Agrupar precioProd + cantProd (stock)
            if (
              field.name === "precioProd" &&
              arr[index + 1]?.name === "cantProd"
            ) {
              acc.push(
                <div
                  key="precio-stock"
                  className="flex flex-col md:flex-row gap-4"
                >
                  {[field, arr[index + 1]].map((f) => (
                    <div key={f.name} className="flex-1 min-w-0 space-y-2">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Input
                        id={f.name}
                        type="number"
                        step={f.name === "precioProd" ? "0.01" : "1"}
                        placeholder={f.placeholder}
                        required={f.required}
                        value={formData[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        disabled={f.disabled}
                        min={0}
                        className="w-full"
                      />
                      {f.error && (
                        <p className="text-xs text-red-600 mt-1">{f.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              );
              return acc;
            }

            // Omitir unidad, subcategoria y cantProd cuando ya agrupados
            if (
              (field.name === "unidad" && arr[index - 1]?.name === "marca") ||
              (field.name === "subcategoria" &&
                arr[index - 1]?.name === "categoria") ||
              (field.name === "cantProd" &&
                arr[index - 1]?.name === "precioProd")
            ) {
              return acc;
            }

            acc.push(
              <div key={field.name} className="w-full space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>

                {field.type === "select" ? (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(val) => handleChange(field.name, val)}
                    disabled={field.disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          field.placeholder || "Selecciona una opción"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {field.options && field.options.length > 0 ? (
                        field.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No hay opciones disponibles
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                ) : field.type === "file" ? (
                  <div className="w-full">
                    <Input
                      id={field.name}
                      type="file"
                      accept="image/*"
                      required={field.required}
                      onChange={(e) =>
                        handleFileChange(
                          field.name,
                          e.target.files?.[0] || null
                        )
                      }
                      className="w-full"
                    />
                    {imagenPreview && (
                      <img
                        src={imagenPreview}
                        alt="Previsualización"
                        className="w-32 h-32 object-cover rounded-md border mt-2"
                      />
                    )}
                  </div>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={field.disabled}
                    className="w-full"
                  />
                )}

                {field.error && (
                  <p className="text-xs text-red-600 mt-1">{field.error}</p>
                )}

                {field.name === "password" && showPasswordStrength && (
                  <div className="space-y-1 w-full">
                    <div className="relative w-full h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength < 50
                            ? "bg-red-500"
                            : passwordStrength < 75
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                      {passwordStrength === 0 && "Introduce una contraseña"}
                      {passwordStrength > 0 &&
                        passwordStrength < 50 &&
                        "Contraseña débil"}
                      {passwordStrength >= 50 &&
                        passwordStrength < 75 &&
                        "Contraseña media"}
                      {passwordStrength >= 75 && "Contraseña fuerte"}
                    </div>
                  </div>
                )}
              </div>
            );

            return acc;
          }, [])}
        </div>
      </div>

      {/* Mensaje de error justo encima del botón (fuera del área con scroll) */}
      {formError && (
        <div className="text-sm text-red-600 text-center mb-2">{formError}</div>
      )}

      {/* Botón fuera del scroll */}
      <Button
        type="submit"
        className="w-full bg-secundario text-black hover:text-[#5e0956]"
      >
        {submitLabel}
      </Button>

      {showSocialButtons && (
        <>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px bg-gray-300 w-full"></div>
            <span className="text-sm text-gray-500">o</span>
            <div className="h-px bg-gray-300 w-full"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onGoogleLogin}
              className="flex-1 border-gray-300 flex items-center justify-center gap-2"
            >
              <FcGoogle className="w-5 h-5" />
              Iniciar con Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onOutlookLogin}
              className="flex-1 border-gray-300 flex items-center justify-center gap-2 text-blue-600"
            >
              <SiMicrosoftoutlook className="w-5 h-5" />
              Iniciar con Outlook
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default DynamicForm;
