import { ChevronDown, FileText, Layout } from 'lucide-react';

type TemplateSelectorProps = {
  templates: string[];
  selectedTemplate: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelect: (template: string) => void;
};

export default function TemplateSelector({
  templates,
  selectedTemplate,
  isOpen,
  onToggleOpen,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#FF6B35]">
        <Layout className="size-4" />
        Export Template
      </div>
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between gap-3 rounded-lg border-2 border-[#FF6B35] bg-white px-4 py-3 text-left text-sm font-medium transition hover:border-[#FF8C00] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
      >
        <span className="min-w-0 truncate text-[#111111]">
          {selectedTemplate || 'Choose a template'}
        </span>
        <ChevronDown className={`size-5 shrink-0 text-[#FF6B35] transition duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-lg border-2 border-[#FF6B35] bg-white shadow-xl">
          {templates.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm font-medium text-[#666666]">
              No templates available yet
            </div>
          ) : (
            <div className="divide-y divide-[rgba(0,0,0,0.08)]">
              {templates.map((template) => (
                <button
                  type="button"
                  key={template}
                  onClick={() => onSelect(template)}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition ${
                    selectedTemplate === template
                      ? 'border-l-4 border-[#FF6B35] bg-[#FFF0E8] text-[#FF6B35]'
                      : 'text-[#111111] hover:bg-[#FFF0E8] hover:text-[#FF6B35]'
                  }`}
                >
                  <FileText className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">{template}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
