// src/components/DocViewer.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function DocViewer() {
  const [selectedArticle, setSelectedArticle] = useState<{title: string, content: string} | null>(null);

  const handleSelectArticle = (title: string) => {
    setSelectedArticle({
      title: title,
      content: `${title}の詳細コンテンツです。Astro ＋ Cloudflare Pagesの組み合わせにより、極限まで最適化された速度で表示されています。`
    });
  };

  return (
    <div className="flex-1 grid grid-cols-4 overflow-hidden">
      {/* 左側：カテゴリ一覧（割合 1） */}
      <aside className="col-span-1 bg-white border-r border-gray-200 overflow-y-auto p-4">
        <Sidebar onSelectArticle={handleSelectArticle} />
      </aside>

      {/* 右側：記事表示エリア（割合 3） */}
      <main className="col-span-3 bg-gray-50 overflow-y-auto p-8">
        {selectedArticle ? (
          <article className="max-w-3xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              {selectedArticle.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">{selectedArticle.content}</p>
          </article>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 stroke-current" viewBox="0 0 24 24" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg">左側のメニューから記事を選択してください。</p>
          </div>
        )}
      </main>
    </div>
  );
}
