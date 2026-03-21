"use client";

import { useState, useEffect } from "react";
import type { MenuItem, SelectedModifier } from "../context/CartContext";

interface ModifierOption {
  id: string;
  name: string;
  price_delta: number;
  is_default: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  description: string | null;
  selection_type: "single" | "multiple";
  is_required: boolean;
  min_selections: number;
  max_selections: number | null;
  options: ModifierOption[];
}

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, modifiers: SelectedModifier[], special_instructions: string) => void;
}

export default function ItemModal({ item, onClose, onAdd }: ItemModalProps) {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchModifiers() {
      try {
        const res = await fetch(`/api/menu/${item.id}/modifiers`);
        if (res.ok) {
          const data = await res.json();
          const groups: ModifierGroup[] = data.modifier_groups ?? [];
          setModifierGroups(groups);
          const defaults: Record<string, string[]> = {};
          for (const group of groups) {
            defaults[group.id] = group.options.filter((o) => o.is_default).map((o) => o.id);
          }
          setSelections(defaults);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchModifiers();
  }, [item.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleOption = (group: ModifierGroup, optionId: string) => {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.selection_type === "single") {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (group.max_selections && current.length >= group.max_selections) {
        return { ...prev, [group.id]: [...current.slice(0, -1), optionId] };
      }
      return { ...prev, [group.id]: [...current, optionId] };
    });
    if (errors[group.id]) {
      setErrors((prev) => { const e = { ...prev }; delete e[group.id]; return e; });
    }
  };

  const modifierTotal = modifierGroups.reduce((sum, group) => {
    const selectedIds = selections[group.id] ?? [];
    return (
      sum +
      group.options
        .filter((o) => selectedIds.includes(o.id))
        .reduce((s, o) => s + o.price_delta, 0)
    );
  }, 0);

  const totalPrice = item.price + modifierTotal;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const group of modifierGroups) {
      if (group.is_required) {
        const selected = (selections[group.id] ?? []).length;
        if (selected < Math.max(group.min_selections, 1)) {
          newErrors[group.id] =
            group.min_selections > 1
              ? `Select at least ${group.min_selections} options`
              : "Please make a selection";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const selectedModifiers: SelectedModifier[] = [];
    for (const group of modifierGroups) {
      for (const option of group.options.filter((o) =>
        (selections[group.id] ?? []).includes(o.id)
      )) {
        selectedModifiers.push({
          modifier_group_id: group.id,
          group_name: group.name,
          modifier_option_id: option.id,
          option_name: option.name,
          price_delta: option.price_delta,
        });
      }
    }
    onAdd(item, selectedModifiers, specialInstructions);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[61] flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none">
        <div className="bg-card border border-border w-full sm:max-w-lg max-h-[92vh] overflow-y-auto pointer-events-auto">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-44 object-cover"
            />
          ) : (
            <div className="w-full h-20 bg-background border-b border-border flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/elasedro-logo.png" alt="" className="h-6 w-auto opacity-10" />
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-serif">{item.name}</h2>
                {item.description && (
                  <p className="text-foreground-muted text-sm mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-foreground-muted hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modifier Groups */}
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <svg className="animate-spin h-5 w-5 text-primary/40" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : modifierGroups.length > 0 ? (
              <div className="space-y-6">
                {modifierGroups.map((group) => (
                  <div key={group.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        {group.description && (
                          <p className="text-xs text-foreground-muted mt-0.5">{group.description}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 ${
                          group.is_required
                            ? "bg-primary/10 text-primary"
                            : "border border-border text-foreground-muted"
                        }`}
                      >
                        {group.is_required ? "Required" : "Optional"}
                      </span>
                    </div>
                    {errors[group.id] && (
                      <p className="text-red-400 text-xs mb-2">{errors[group.id]}</p>
                    )}
                    <div className="space-y-2">
                      {group.options.map((option) => {
                        const isSelected = (selections[group.id] ?? []).includes(option.id);
                        return (
                          <button
                            key={option.id}
                            onClick={() => toggleOption(group, option.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 border transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-foreground-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
                                  isSelected ? "border-primary bg-primary" : "border-border"
                                } ${group.selection_type === "single" ? "rounded-full" : ""}`}
                              >
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 text-background" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm">{option.name}</span>
                            </div>
                            {option.price_delta > 0 && (
                              <span className="text-sm text-primary">
                                +${option.price_delta.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Special Instructions
                <span className="text-foreground-muted font-normal ml-1">(optional)</span>
              </label>
              <textarea
                placeholder="No onions, extra sauce, well done…"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-background border border-border focus:border-primary focus:outline-none resize-none text-sm placeholder:text-foreground-muted/40"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              className="w-full bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors flex items-center justify-center gap-3"
            >
              <span>Add to Order</span>
              <span className="opacity-50">·</span>
              <span>${totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
