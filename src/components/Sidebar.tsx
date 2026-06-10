// src/components/Sidebar.tsx
import React, { useState } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
}

interface Category {
  id: string;
  name: string;
  articles: Article[];
}

interface SidebarProps {
  categories: Category[];
  onSelectArticle: (article: Article) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories, onSelectArticle }) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(categories[0]?.id || null);

  const toggleCategory = (id: string) => {
    setOpenCategoryId(openCategoryId === id ? null : id);
  };

  return (
    <nav className="space-y-2">
      {categories.map((category) => {
        const isOpen = openCategoryId === category.id;
        return (
          <div key={category.id} className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex justify-between items-center text-left font-semibold text-gray-700 py-2 px-3 hover:bg-gray-50 rounded transition"
            >
              <span>{category.name}</span>
              <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {category.articles.map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => onSelectArticle(article)}
                      className="w-full text-left text-sm text-gray-600 hover:text-orange-500 py-1.5 px-2 block rounded hover:bg-orange-50 transition"
                    >
                      {article.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
};