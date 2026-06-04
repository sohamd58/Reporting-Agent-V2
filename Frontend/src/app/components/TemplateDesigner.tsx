import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X, ArrowLeft, ArrowRight, Edit2, Trash2, GripVertical, Save, FilePlus } from 'lucide-react';
import { saveTemplate } from '../api';

type DataType = 'Number' | 'Text' | 'Datetime' | 'Number (Currency)';
type ColumnType = 'mapped' | 'calculated';

interface Column {
  id: string;
  name: string;
  type: ColumnType;
  sourceColumn?: string;
  dataType?: DataType;
  displayFormat?: string;
  formula?: FormulaElement[];
}

interface FormulaElement {
  type: 'column' | 'value';
  value: string;
  operator?: 'add' | 'subtract' | 'multiply' | 'divide';
}

const rawColumns = [
  { name: 'campaign_id', type: 'Text' as DataType },
  { name: 'campaign_name', type: 'Text' as DataType },
  { name: 'date', type: 'Datetime' as DataType },
  { name: 'channel', type: 'Text' as DataType },
  { name: 'sent', type: 'Number' as DataType },
  { name: 'delivered', type: 'Number' as DataType },
  { name: 'opened', type: 'Number' as DataType },
  { name: 'clicked', type: 'Number' as DataType },
  { name: 'conversions', type: 'Number' as DataType },
  { name: 'revenue', type: 'Number (Currency)' as DataType },
];

const displayFormats: Record<DataType, string[]> = {
  'Number': ['Integer', 'Decimal', 'Percentage'],
  'Number (Currency)': ['USD', 'EUR', 'GBP', 'INR'],
  'Text': ['Normal', 'Bold', 'Italic', 'Uppercase', 'Lowercase'],
  'Datetime': ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'Full Date'],
};

export default function TemplateDesigner({ onBack }: { onBack: () => void }) {
  const [platform, setPlatform] = useState<'Clevertap' | 'Moengage'>('Clevertap');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const availableChannels = platform === 'Clevertap'
    ? ['Email', 'Push', 'SMS', 'WhatsApp', 'In-App']
    : ['Email', 'Push', 'SMS', 'Web Push'];

  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: 'Campaign ID', type: 'mapped', sourceColumn: 'campaign_id', dataType: 'Text', displayFormat: 'Normal' },
    { id: '2', name: 'Campaign Name', type: 'mapped', sourceColumn: 'campaign_name', dataType: 'Text', displayFormat: 'Normal' },
    { id: '3', name: 'Date', type: 'mapped', sourceColumn: 'date', dataType: 'Datetime', displayFormat: 'YYYY-MM-DD' },
    { id: '4', name: 'Sent', type: 'mapped', sourceColumn: 'sent', dataType: 'Number', displayFormat: 'Integer' },
    { id: '5', name: 'Delivered', type: 'mapped', sourceColumn: 'delivered', dataType: 'Number', displayFormat: 'Integer' },
  ]);

  const buildFormulaString = (formula: FormulaElement[] | undefined) => {
    if (!formula || formula.length === 0) return '';
    const operatorMap: Record<string, string> = {
      add: '+',
      subtract: '-',
      multiply: '*',
      divide: '/',
    };

    return formula
      .map((element, index) => {
        const token = element.type === 'column' ? element.value : element.value;
        if (index === 0) {
          return token;
        }
        const op = element.operator ? operatorMap[element.operator] : '+';
        return `${op} ${token}`;
      })
      .join(' ');
  };

  const buildTemplateColumns = () => {
    return columns.map((column) => {
      if (column.type === 'mapped') {
        return {
          name: column.name,
          source: 'direct',
          column: column.sourceColumn ?? '',
        };
      }

      return {
        name: column.name,
        source: 'calculated',
        formula: buildFormulaString(column.formula),
      };
    });
  };

  const [editForm, setEditForm] = useState({
    name: '',
    columnType: 'mapped' as ColumnType,
    sourceColumn: '',
    dataType: 'Text' as DataType,
    displayFormat: 'Normal',
    formula: [] as FormulaElement[],
  });

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const handleAddColumn = (position: 'left' | 'right', columnId: string) => {
    const index = columns.findIndex(c => c.id === columnId);
    const newColumn: Column = {
      id: Date.now().toString(),
      name: 'New Column',
      type: 'mapped',
      sourceColumn: rawColumns[0].name,
      dataType: rawColumns[0].type,
      displayFormat: displayFormats[rawColumns[0].type][0],
    };
    const newColumns = [...columns];
    newColumns.splice(position === 'left' ? index : index + 1, 0, newColumn);
    setColumns(newColumns);
    setShowColumnMenu(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns(columns.filter(c => c.id !== columnId));
    setShowColumnMenu(null);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setEditForm({
      name: column.name,
      columnType: column.type,
      sourceColumn: column.sourceColumn || '',
      dataType: column.dataType || 'Text',
      displayFormat: column.displayFormat || 'Normal',
      formula: column.formula || [],
    });
    setShowColumnMenu(null);
  };

  const handleApplyEdit = () => {
    if (editingColumn) {
      setColumns(columns.map(c =>
        c.id === editingColumn.id
          ? {
              ...c,
              name: editForm.name,
              type: editForm.columnType,
              sourceColumn: editForm.columnType === 'mapped' ? editForm.sourceColumn : undefined,
              dataType: editForm.columnType === 'mapped' ? editForm.dataType : undefined,
              displayFormat: editForm.columnType === 'mapped' ? editForm.displayFormat : undefined,
              formula: editForm.columnType === 'calculated' ? editForm.formula : undefined,
            }
          : c
      ));
      setEditingColumn(null);
    }
  };

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== columnId) {
      const draggedIndex = columns.findIndex(c => c.id === draggedColumn);
      const targetIndex = columns.findIndex(c => c.id === columnId);
      const newColumns = [...columns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      setColumns(newColumns);
    }
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const addFormulaElement = () => {
    setEditForm({
      ...editForm,
      formula: [
        ...editForm.formula,
        { type: 'column', value: rawColumns[0].name, operator: 'add' },
      ],
    });
  };

  const updateFormulaElement = (index: number, updates: Partial<FormulaElement>) => {
    const newFormula = [...editForm.formula];
    newFormula[index] = { ...newFormula[index], ...updates };
    setEditForm({ ...editForm, formula: newFormula });
  };

  const removeFormulaElement = (index: number) => {
    setEditForm({
      ...editForm,
      formula: editForm.formula.filter((_, i) => i !== index),
    });
  };

  const handleSaveTemplate = async (templateName: string) => {
    if (!templateName.trim()) {
      setSaveError('Enter a template name before saving.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await saveTemplate(templateName.trim(), buildTemplateColumns());
      setShowSaveDialog(false);
      setNewTemplateName('');
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#F4F5F6] border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-baseline gap-3">
              <h1 className="text-[#111111]">Tribe.</h1>
              <span className="text-sm text-[#666666] tracking-wide">Template Designer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Selection Section */}
        <section className="bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-8 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
            <h2 className="text-[#111111]">Template Selection</h2>
          </div>

          {/* Platform Selector */}
          <div className="space-y-3">
            <label className="text-[#111111] block">Select Platform</label>
            <div className="relative">
              <button
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                className="w-full max-w-md bg-[#F4F5F6] px-4 py-3 rounded-md flex items-center justify-between text-[#111111] transition-all duration-200 hover:bg-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
              >
                <span>{platform}</span>
                <ChevronDown className="w-5 h-5 text-[#666666] transition-transform duration-200" style={{ transform: showPlatformDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              {showPlatformDropdown && (
                <div className="absolute top-full mt-2 w-full max-w-md bg-white border border-[rgba(0,0,0,0.08)] rounded-md shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  {(['Clevertap', 'Moengage'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPlatform(p);
                        setShowPlatformDropdown(false);
                        setSelectedChannels([]);
                      }}
                      className="w-full px-4 py-3 text-left text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#FF6B35] transition-colors duration-150"></span>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-4">
            <label className="text-[#111111] block">Select Channels</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {availableChannels.map((channel) => (
                <button
                  key={channel}
                  onClick={() => handleChannelToggle(channel)}
                  className={`px-4 py-3 rounded-md border transition-all duration-200 ${
                    selectedChannels.includes(channel)
                      ? 'bg-[#FF6B35] border-[#FF6B35] text-white shadow-sm'
                      : 'bg-[#F4F5F6] border-transparent text-[#111111] hover:border-[#FF6B35]'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Template Preview */}
        {selectedChannels.length > 0 && (
          <section className="bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-8 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <div className="overflow-x-auto rounded-md border border-[rgba(0,0,0,0.08)]">
              <table className="w-full">
                <thead className="bg-[#F4F5F6]">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        draggable
                        onDragStart={() => handleDragStart(column.id)}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragEnd={handleDragEnd}
                        className="px-4 py-3 text-left text-sm text-[#111111] cursor-move select-none relative group"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                          <button
                            onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                            className="hover:text-[#FF6B35] transition-colors duration-150"
                          >
                            {column.name}
                          </button>
                        </div>

                        {/* Column Menu */}
                        {showColumnMenu === column.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-[rgba(0,0,0,0.08)] rounded-md shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[200px]">
                            <button
                              onClick={() => handleAddColumn('left', column.id)}
                              className="w-full px-4 py-2 text-left text-sm text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2"
                            >
                              <ArrowLeft className="w-4 h-4 text-[#FF6B35]" />
                              Add Column Left
                            </button>
                            <button
                              onClick={() => handleAddColumn('right', column.id)}
                              className="w-full px-4 py-2 text-left text-sm text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2"
                            >
                              <ArrowRight className="w-4 h-4 text-[#FF6B35]" />
                              Add Column Right
                            </button>
                            <button
                              onClick={() => handleEditColumn(column)}
                              className="w-full px-4 py-2 text-left text-sm text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-[#FF6B35]" />
                              Edit Column
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(column.id)}
                              className="w-full px-4 py-2 text-left text-sm text-[#111111] hover:bg-[#F4F5F6] transition-colors duration-150 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-[#FF6B35]" />
                              Delete Column
                            </button>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-t border-[rgba(0,0,0,0.04)]">
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3 text-sm text-[#666666]">
                        Example data
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleSaveTemplate(`${platform} Custom Default`)}
                disabled={isSaving}
                className="px-6 py-3 bg-[#FF6B35] text-white rounded-md flex items-center gap-2 hover:bg-[#FF8C00] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                Save Changes to Default
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-6 py-3 bg-[#F4F5F6] text-[#111111] rounded-md flex items-center gap-2 hover:bg-[#EFEFEF] transition-all duration-200 border border-[rgba(0,0,0,0.08)] hover:border-[#FF6B35]"
              >
                <FilePlus className="w-5 h-5" />
                Create New Format Template
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white text-[#666666] rounded-md flex items-center gap-2 hover:bg-[#F4F5F6] transition-all duration-200 border border-[rgba(0,0,0,0.08)]"
              >
                Cancel
              </button>
            </div>
            {saveError && (
              <div className="text-sm text-[#111111] bg-[#F4F5F6] rounded-md p-3">
                {saveError}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Edit Column Dialog */}
      {editingColumn && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <h3 className="text-[#111111]">Edit Column</h3>
              <button
                onClick={() => setEditingColumn(null)}
                className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Column Name */}
              <div className="space-y-2">
                <label className="text-[#111111] block">Column Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#F4F5F6] px-4 py-3 rounded-md text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all duration-200"
                />
              </div>

              {/* Column Type */}
              <div className="space-y-2">
                <label className="text-[#111111] block">Column Type</label>
                <select
                  value={editForm.columnType}
                  onChange={(e) => setEditForm({ ...editForm, columnType: e.target.value as ColumnType })}
                  className="w-full bg-[#F4F5F6] px-4 py-3 rounded-md text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all duration-200"
                >
                  <option value="mapped">Mapped</option>
                  <option value="calculated">Calculated</option>
                </select>
              </div>

              {/* Mapped Section */}
              {editForm.columnType === 'mapped' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[#111111] text-sm">Source Mapping</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-[#666666]">Source Column</label>
                      <select
                        value={editForm.sourceColumn}
                        onChange={(e) => {
                          const selectedCol = rawColumns.find(c => c.name === e.target.value);
                          setEditForm({
                            ...editForm,
                            sourceColumn: e.target.value,
                            dataType: selectedCol?.type || 'Text',
                            displayFormat: selectedCol ? displayFormats[selectedCol.type][0] : 'Normal',
                          });
                        }}
                        className="w-full bg-[#F4F5F6] px-4 py-2 rounded-md text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all duration-200"
                      >
                        {rawColumns.map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-[#F4F5F6] rounded-md p-3">
                      <div className="text-xs text-[#666666]">Data Type</div>
                      <div className="text-sm text-[#111111] mt-1">{editForm.dataType}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[#111111] text-sm">Display Format</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-[#666666]">Format</label>
                      <select
                        value={editForm.displayFormat}
                        onChange={(e) => setEditForm({ ...editForm, displayFormat: e.target.value })}
                        className="w-full bg-[#F4F5F6] px-4 py-2 rounded-md text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all duration-200"
                      >
                        {displayFormats[editForm.dataType].map((format) => (
                          <option key={format} value={format}>
                            {format}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculated Section */}
              {editForm.columnType === 'calculated' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#111111] text-sm">Formula Builder</h4>
                    <button
                      onClick={addFormulaElement}
                      className="text-sm text-[#FF6B35] hover:text-[#FF8C00] flex items-center gap-1 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editForm.formula.map((element, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {index > 0 && (
                          <select
                            value={element.operator}
                            onChange={(e) => updateFormulaElement(index, { operator: e.target.value as any })}
                            className="bg-[#F4F5F6] px-3 py-2 rounded-md text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          >
                            <option value="add">+</option>
                            <option value="subtract">-</option>
                            <option value="multiply">×</option>
                            <option value="divide">÷</option>
                          </select>
                        )}

                        <select
                          value={element.type}
                          onChange={(e) => updateFormulaElement(index, { type: e.target.value as 'column' | 'value' })}
                          className="bg-[#F4F5F6] px-3 py-2 rounded-md text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        >
                          <option value="column">Column</option>
                          <option value="value">Fixed Value</option>
                        </select>

                        {element.type === 'column' ? (
                          <select
                            value={element.value}
                            onChange={(e) => updateFormulaElement(index, { value: e.target.value })}
                            className="flex-1 bg-[#F4F5F6] px-4 py-2 rounded-md text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          >
                            {rawColumns.map((col) => (
                              <option key={col.name} value={col.name}>
                                {col.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={element.value}
                            onChange={(e) => updateFormulaElement(index, { value: e.target.value })}
                            placeholder="Enter value"
                            className="flex-1 bg-[#F4F5F6] px-4 py-2 rounded-md text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          />
                        )}

                        <button
                          onClick={() => removeFormulaElement(index)}
                          className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {editForm.formula.length === 0 && (
                      <div className="text-sm text-[#666666] text-center py-4">
                        Click "Add Field" to start building your formula
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dialog Actions */}
            <div className="p-6 border-t border-[rgba(0,0,0,0.08)] flex gap-3 justify-end">
              <button
                onClick={() => setEditingColumn(null)}
                className="px-6 py-2 bg-white text-[#666666] rounded-md hover:bg-[#F4F5F6] transition-all duration-200 border border-[rgba(0,0,0,0.08)]"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyEdit}
                className="px-6 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF8C00] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <h3 className="text-[#111111]">Create New Template</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-[#666666] hover:text-[#FF6B35] transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[#111111] block">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full bg-[#F4F5F6] px-4 py-3 rounded-md text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all duration-200"
                />
              </div>
              {saveError && (
                <div className="text-sm text-[#111111] bg-[#F4F5F6] rounded-md p-3">
                  {saveError}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[rgba(0,0,0,0.08)] flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-6 py-2 bg-white text-[#666666] rounded-md hover:bg-[#F4F5F6] transition-all duration-200 border border-[rgba(0,0,0,0.08)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveTemplate(newTemplateName);
                }}
                disabled={isSaving}
                className="px-6 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF8C00] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isSaving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
