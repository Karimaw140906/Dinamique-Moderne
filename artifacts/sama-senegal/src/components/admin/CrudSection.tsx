import React, { useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";

interface CrudSectionProps {
  items: any[];
  setItems: (items: any[]) => void;
  defaultItem: any;
  renderForm: (item: any, onChange: (field: string, val: any) => void) => React.ReactNode;
  renderCard: (item: any, index: number) => React.ReactNode;
  sectionTitle: string;
  canManage?: (item: any) => boolean;
  stampNew?: (item: any) => any;
}

export function CrudSection({
  items,
  setItems,
  defaultItem,
  renderForm,
  renderCard,
  sectionTitle,
  canManage,
  stampNew,
}: CrudSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const isManaged = (item: any) => (canManage ? canManage(item) : true);

  const visibleEntries = items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => isManaged(item));

  const openAdd = () => {
    const base = { ...defaultItem, id: Date.now() };
    setFormData(stampNew ? stampNew(base) : base);
    setEditingIndex(-1);
  };

  const openEdit = (index: number) => {
    setFormData({ ...items[index] });
    setEditingIndex(index);
  };

  const closeForm = () => {
    setFormData(null);
    setEditingIndex(null);
  };

  const saveForm = () => {
    if (!formData) return;
    const newItems = [...items];
    if (editingIndex === -1) {
      newItems.push(formData);
    } else if (editingIndex !== null) {
      newItems[editingIndex] = formData;
    }
    setItems(newItems);
    closeForm();
  };

  const deleteItem = (index: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">{sectionTitle}</h2>
        <button
          onClick={openAdd}
          className="bg-[#2C7A5C] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#245f49] transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEntries.map(({ item, i }) => (
          <div key={item.id || i} className="bg-white rounded-xl shadow-sm overflow-hidden relative group border border-gray-100">
            <div className="p-4">
              {renderCard(item, i)}
            </div>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEdit(i)}
                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 shadow-md"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteItem(i)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {formData && (
        <div className="fixed inset-0 z-[300] flex">
          <div className="fixed inset-0 bg-black/40" onClick={closeForm} />
          <div className="ml-auto w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingIndex === -1 ? "Ajouter" : "Modifier"}</h3>
              <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderForm(formData, handleChange)}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={closeForm} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300">Annuler</button>
              <button onClick={saveForm} className="px-4 py-2 bg-[#2C7A5C] text-white rounded-xl hover:bg-[#245f49]">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
