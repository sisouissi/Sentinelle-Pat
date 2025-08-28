import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export function Footer(): React.ReactNode {
  const { t } = useTranslation();

  return (
    <footer className="text-center p-4 text-xs text-slate-400 dark:text-slate-500">
      <p>{t('footer.copyright')}</p>
    </footer>
  );
}
