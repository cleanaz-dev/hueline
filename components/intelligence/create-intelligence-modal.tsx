'use client';

import { useState, useEffect } from 'react';
import {
  IntelligenceConfig,
  IntelligenceModalProps,
  IntelligenceTab,
  PricingCategory,
  PricingItem,
} from './types';
import { DEFAULT_CONFIG, generateId } from './constants';
import { IntelligenceModalHeader } from './intelligence-modal-header';
import { IntelligenceModalSidebar } from './intelligence-modal-sidebar';
import { IntelligenceModalFooter } from './intelligence-modal-footer';
import { PriceBookTab } from './tabs/price-book-tab';
import { RulesTab } from './tabs/rules-tab';

export function IntelligenceModal({ isOpen, onClose, initialData, onSave }: IntelligenceModalProps) {
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('priceBook');
  const [config, setConfig] = useState<IntelligenceConfig>(DEFAULT_CONFIG);

  // Before
// const isEditMode = !!initialData && (initialData.priceBook?.length > 0 ?? false);

// After
const isEditMode = !!initialData?.priceBook?.length;


  useEffect(() => {
    if (isOpen) {
      const hasExistingData = initialData?.priceBook && initialData.priceBook.length > 0;
      setConfig(hasExistingData ? (initialData as IntelligenceConfig) : DEFAULT_CONFIG);
      setActiveTab('priceBook');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // --- HANDLERS: PRICE BOOK ---
  const addPriceItem = (type: PricingCategory) => {
    const newItem: PricingItem = {
      id: generateId(),
      name: '',
      amount: 0,
      type,
      unit: type === 'UNIT_COST' ? 'sqft' : undefined,
    };
    setConfig((prev) => ({ ...prev, priceBook: [...prev.priceBook, newItem] }));
  };

  const updatePriceItem = (id: string, field: keyof PricingItem, value: any) => {
    setConfig((prev) => ({
      ...prev,
      priceBook: prev.priceBook.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removePriceItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      priceBook: prev.priceBook.filter((item) => item.id !== id),
    }));
  };

  // --- HANDLERS: AI RULES (FLAGS) ---
  const addRule = (flag: string) => {
    setConfig((prev) => ({ ...prev, contextFlags: [...prev.contextFlags, flag] }));
  };

  const removeRule = (flagToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      contextFlags: prev.contextFlags.filter((f) => f !== flagToRemove),
      // Also remove any linked pricing item to keep data clean
      priceBook: prev.priceBook.filter((item) => item.name !== flagToRemove),
    }));
  };

  // The Magic: Link a price impact directly to a flag
  const setRuleImpact = (flag: string, type: PricingCategory | 'NONE') => {
    setConfig((prev) => {
      const existingItem = prev.priceBook.find((p) => p.name === flag);

      if (type === 'NONE') {
        if (!existingItem) return prev;
        return {
          ...prev,
          priceBook: prev.priceBook.filter((item) => item.id !== existingItem.id),
        };
      }

      if (existingItem) {
        return {
          ...prev,
          priceBook: prev.priceBook.map((item) =>
            item.id === existingItem.id ? { ...item, type } : item
          ),
        };
      }

      const newItem: PricingItem = {
        id: generateId(),
        name: flag,
        amount: type === 'MULTIPLIER' ? 1.2 : 50,
        type,
      };
      return { ...prev, priceBook: [...prev.priceBook, newItem] };
    });
  };

  // --- FILTERED DATA FOR UI ---
  // We hide linked AI Rules from the Core Price book so they don't show up twice
  const corePriceBook = config.priceBook.filter(
    (item) => !config.contextFlags.includes(item.name)
  );

  const unitCosts = corePriceBook.filter((i) => i.type === 'UNIT_COST');
  const flatFees = corePriceBook.filter((i) => i.type === 'FLAT_FEE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden ring-1 ring-zinc-200">
        <IntelligenceModalHeader isEditMode={isEditMode} onClose={onClose} />

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 overflow-hidden bg-zinc-50/50">
          <IntelligenceModalSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'priceBook' && (
              <PriceBookTab
                unitCosts={unitCosts}
                flatFees={flatFees}
                onAddItem={addPriceItem}
                onUpdateItem={updatePriceItem}
                onRemoveItem={removePriceItem}
              />
            )}

            {activeTab === 'rules' && (
              <RulesTab
                contextFlags={config.contextFlags}
                priceBook={config.priceBook}
                onAddRule={addRule}
                onRemoveRule={removeRule}
                onSetImpact={setRuleImpact}
                onUpdatePriceItem={updatePriceItem}
              />
            )}
          </div>
        </div>

        <IntelligenceModalFooter
          isEditMode={isEditMode}
          onClose={onClose}
          onSave={() => onSave(config)}
        />
      </div>
    </div>
  );
}
