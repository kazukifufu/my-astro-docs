// src/components/Sidebar.tsx
import React, { useState } from 'react';

const categories = [
  {
    id: 'cat1',
    name: '🎨 デザイン・UI',
    articles: [
      { id: 'a1', title: 'Tailwind CSSで魅せるモダンUI' },
      { id: 'a2', title: 'ダークモードに対応する配色テクニック' },
      { id: 'a3', title: 'レスポンシブWebデザインの基本原則' },
    ]
  },
  {
    id: 'cat2',
    name: '⚡ フロントエンド',
    articles: [
      { id: 'a4', title: 'React Hooks（useState）の基礎知識' },
      { id: 'a5', title: 'Next.js App Routerの仕組みとメリット' },
      { id: 'a6', title: 'TypeScriptで型安全なコードを書く方法' },
    ]
  },
  {
    id: 'cat3',
    name: '☁️ サーバー・インフラ',
    articles: [
      { id: 'a7', title: 'Cloudflare Pagesでサイトを爆速公開' },
      { id: 'a8', title: 'Cloudflare Workersで作るエッジAPI' },
      { id: 'a9', title: 'D1（軽量分散SQLite）のデータベース運用' },
    ]
  }
];

interface SidebarProps {
  onSelectArticle: (title: string) => void;
}

export default function Sidebar({ onSelectArticle }: SidebarProps) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

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
                      onClick={() => onSelectArticle(article.title)}
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
}
