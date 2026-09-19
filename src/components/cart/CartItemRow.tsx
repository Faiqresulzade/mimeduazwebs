import type { CartItem } from '../../types';
import { formatPrice } from '../../lib/format';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CartItemRowProps {
  item: CartItem;
  removing?: boolean;
  onRemove: () => void;
}

export function CartItemRow({ item, removing, onRemove }: CartItemRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-brand-borderLight px-5 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <StatusBadge tone="neutral">
          {item.itemType === 'Training'
            ? 'Təlim'
            : item.itemType === 'Exam'
              ? 'Sınaq'
              : 'Resurs'}
        </StatusBadge>
        <p className="mt-2 font-heading text-[15px] font-semibold text-brand-navy">
          {item.name}
        </p>
      </div>
      <span className="font-heading font-bold text-brand-navy">
        {formatPrice(item.price)}
      </span>
      <Button variant="danger" size="sm" disabled={removing} onClick={onRemove}>
        Sil
      </Button>
    </li>
  );
}
