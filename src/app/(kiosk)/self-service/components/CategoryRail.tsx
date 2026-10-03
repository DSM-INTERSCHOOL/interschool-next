import { TopCategoryRead } from "@/interfaces/ITopCategory";

export const ALL_CATEGORIES = "__all__";

interface CategoryRailProps {
  categories: TopCategoryRead[];
  selected: string;
  onSelect: (value: string) => void;
}

export function CategoryRail({ categories, selected, onSelect }: CategoryRailProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-4">
      <button
        type="button"
        onClick={() => onSelect(ALL_CATEGORIES)}
        className={`btn btn-lg h-auto shrink-0 rounded-2xl px-8 py-4 text-lg font-semibold ${
          selected === ALL_CATEGORIES ? "btn-primary" : "btn-outline"
        }`}
      >
        Todo
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(String(category.id))}
          className={`btn btn-lg h-auto shrink-0 rounded-2xl px-8 py-4 text-lg font-semibold ${
            selected === String(category.id) ? "btn-primary" : "btn-outline"
          }`}
        >
          {category.description}
        </button>
      ))}
    </div>
  );
}
