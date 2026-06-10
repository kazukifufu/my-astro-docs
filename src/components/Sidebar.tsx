// src/components/Sidebar.tsx
import React from 'react';

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
  // 渡されたカテゴリや記事データに基づいて自動ループ処理
  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-200">
      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h2 className="font-bold text-gray-700 mb-2">{cat.name}</h2>
          <ul>
            {cat.articles.map((art) => (
              <li key={art.id} className="mb-1">
                <button
                  onClick={() => onSelectArticle(art)}
                  className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:underline py-1"
                >
                  {art.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};