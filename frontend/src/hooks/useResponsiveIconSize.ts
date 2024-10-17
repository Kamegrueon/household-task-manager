// src/hooks/useResponsiveIconSize.ts

import { useState, useEffect } from 'react';

/**
 * アイコンサイズを画面幅に応じて変更するカスタムフック
 * @param breakpoint - レスポンシブのブレークポイント（デフォルト: 768px）
 * @param mobileSize - モバイルサイズ（デフォルト: 16）
 * @param desktopSize - デスクトップサイズ（デフォルト: 24）
 * @returns iconSize - 現在のアイコンサイズ
 */
const useResponsiveIconSize = (
  breakpoint: number = 768,
  mobileSize: number = 16,
  desktopSize: number = 24
): number => {
  const [iconSize, setIconSize] = useState<number>(desktopSize);

  useEffect(() => {
    const updateIconSize = () => {
      if (window.innerWidth < breakpoint) {
        setIconSize(mobileSize);
      } else {
        setIconSize(desktopSize);
      }
    };

    // 初回レンダリング時にサイズを設定
    updateIconSize();

    // ウィンドウリサイズ時にサイズを更新
    window.addEventListener('resize', updateIconSize);

    // クリーンアップ
    return () => window.removeEventListener('resize', updateIconSize);
  }, [breakpoint, mobileSize, desktopSize]);

  return iconSize;
};

export default useResponsiveIconSize;
