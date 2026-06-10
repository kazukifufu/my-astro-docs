// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';

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
  categories?: Category[]; // 必須ではなくオプショナルにして安全性を確保
  onSelectArticle: (article: Article) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories = [], onSelectArticle }) => {
  // categoriesが空配列だった場合でもエラーにならないようにガードを徹底
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // コンポーネントが読み込まれた際、最初のカテゴリがあれば自動で開く
  useEffect(() => {
    if (categories && categories.length > 0 && !openCategoryId) {
      setOpenCategoryId(categories[0].id);
    }
  }, [categories]);

  const toggleCategory = (id: string) => {
    setOpenCategoryId(openCategoryId === id ? null : id);
  };

  if (!categories || categories.length === 0) {
    return <div className="text-sm text-gray-400 p-4">記事がありません。</div>;
  }

  return (
    <nav className="space-y-2">
      {categories.map((category) => {
        if (!category) return null;
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

            {isOpen && category.articles && (
              <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {category.articles.map((article) => {
                  if (!article) return null;
                  return (
                    <li key={article.id}>
                      <button
                        onClick={() => onSelectArticle(article)}
                        className="w-full text-left text-sm text-gray-600 hover:text-orange-500 py-1.5 px-2 block rounded hover:bg-orange-50 transition"
                      >
                        {article.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
};