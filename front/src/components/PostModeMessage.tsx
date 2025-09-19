'use client';

interface PostModeMessageProps {
  isVisible: boolean;
}

export default function PostModeMessage({ isVisible }: PostModeMessageProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <p className="text-gray-800 font-semibold text-2xl drop-shadow-lg">
        場所を選択してください
      </p>
    </div>
  );
}