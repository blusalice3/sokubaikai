import React, { useState } from 'react';

interface UrlUpdateDialogProps {
  currentUrl: string;
  onConfirm: (newUrl: string, sheetName: string) => void;
  onCancel: () => void;
}

const UrlUpdateDialog: React.FC<UrlUpdateDialogProps> = ({ currentUrl, onConfirm, onCancel }) => {
  const [newUrl, setNewUrl] = useState(currentUrl);
  const [sheetName, setSheetName] = useState('');

  const handleSubmit = () => {
    if (newUrl.trim()) {
      onConfirm(newUrl.trim(), sheetName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">スプレッドシートURLの更新</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          保存されているURLが無効です。新しいURLを入力してください。
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              スプレッドシートURL
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              シート名（オプション）
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="空欄の場合は最初のシート"
              className="block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newUrl.trim()}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlUpdateDialog;