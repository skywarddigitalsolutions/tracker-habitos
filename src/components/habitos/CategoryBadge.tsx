import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import {
  Heart, Brain, Briefcase, Home, Users, DollarSign, Palette, Circle,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Heart, Brain, Briefcase, Home, Users, DollarSign, Palette, Circle,
};

interface CategoryBadgeProps {
  categoryId: number | null;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ categoryId, size = 'sm' }: CategoryBadgeProps) {
  const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;

  const Icon = ICONS[cat.icon] ?? Circle;

  return (
    <Badge
      style={{ backgroundColor: cat.color + '22', color: cat.color }}
      className="font-medium"
    >
      <Icon size={size === 'sm' ? 10 : 12} />
      {cat.name}
    </Badge>
  );
}
