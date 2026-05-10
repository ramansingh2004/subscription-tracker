import Link from 'next/link';

interface Props {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  secondaryActionHref,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionText && (
          actionHref ? (
            <Link
              href={actionHref}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              {actionText}
            </button>
          )
        )}

        {secondaryActionText && (
          secondaryActionHref ? (
            <Link
              href={secondaryActionHref}
              className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              {secondaryActionText}
            </Link>
          ) : (
            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium transition">
              {secondaryActionText}
            </button>
          )
        )}
      </div>
    </div>
  );
}