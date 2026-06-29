'use client';

import { useState, useEffect } from 'react';
import { useOwner } from '@/context/owner-context';
import {
  IntelligenceConfig,
  IntelligenceModalProps,
  IntelligenceTab,
  PricingItem,
} from './types';
import { DEFAULT_CONFIG, generateId } from './constants';
import { IntelligenceModalHeader } from './intelligence-modal-header';
import { IntelligenceModalSidebar } from './intelligence-modal-sidebar';
import { IntelligenceModalFooter } from './intelligence-modal-footer';
import { PriceBookTab } from './tabs/price-book-tab';
import { ModifiersTab } from './tabs/modifiers-tab';
  // new tab

export function IntelligenceModal({ isOpen, onClose, initialData }: IntelligenceModalProps) {
  const { subdomain, isSavingIntelligence, handleSaveIntelligence } = useOwner();
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('priceBook');
  const [config, setConfig] = useState<IntelligenceConfig>(DEFAULT_CONFIG);

  const isEditMode = !!initialData?.priceBook?.length;

  useEffect(() => {
    if (isOpen) {
      const hasExistingData = initialData?.priceBook && initialData.priceBook.length > 0;
      setConfig(hasExistingData ? (initialData as IntelligenceConfig) : DEFAULT_CONFIG);
      setActiveTab('priceBook');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // --- SAVE HANDLER ---
  const handleSaveClick = async () => {
    const intelligenceId = subdomain?.intelligence?.id;
    if (!intelligenceId) {
      console.error("No intelligence ID found");
      return;
    }
    const success = await handleSaveIntelligence(intelligenceId, config);
    if (success) onClose();
  };

  // --- CALCULATIONS FOR SIDEBAR COUNTS ---
  const allItems = config.priceBook;
  const modifiers = allItems.filter((item) => item.isModifier);

  // --- HANDLERS (single list operations) ---
  const addPriceItem = () => {
    const newItem: PricingItem = {
      id: generateId(),
      name: '',
      amount: 50,              // sensible default
      type: 'FLAT_FEE',
      isModifier: false,
      unit: undefined,
    };
    setConfig((prev) => ({ ...prev, priceBook: [...prev.priceBook, newItem] }));
  };

  const updatePriceItem = (id: string, updates: Partial<PricingItem>) => {
    setConfig((prev) => ({
      ...prev,
      priceBook: prev.priceBook.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removePriceItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      priceBook: prev.priceBook.filter((item) => item.id !== id),
    }));
  };

  // Convenience handler for toggling modifier state
  const toggleModifier = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      priceBook: prev.priceBook.map((item) =>
        item.id === id
          ? {
              ...item,
              isModifier: !item.isModifier,
              // When turning on, ensure trigger exists (empty)
              trigger: !item.isModifier ? '' : item.trigger,
            }
          : item
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden ring-1 ring-zinc-200">
        <IntelligenceModalHeader isEditMode={isEditMode} onClose={onClose} />

        <div className="flex flex-1 overflow-hidden bg-zinc-50/50">
          <IntelligenceModalSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allCount={allItems.length}
            modifierCount={modifiers.length}
          />

          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'priceBook' && (
              <PriceBookTab
                items={allItems}
                onAddItem={addPriceItem}
                onUpdateItem={updatePriceItem}
                onRemoveItem={removePriceItem}
                onToggleModifier={toggleModifier}
              />
            )}

            {activeTab === 'modifiers' && (
              <ModifiersTab
                items={modifiers}
                onUpdateItem={updatePriceItem}
                onRemoveModifierStatus={(id) =>
                  updatePriceItem(id, { isModifier: false })
                }
              />
            )}
          </div>
        </div>

        <IntelligenceModalFooter
          isEditMode={isEditMode}
          isSaving={isSavingIntelligence}
          onClose={onClose}
          onSave={handleSaveClick}
        />
      </div>
    </div>
  );
}
