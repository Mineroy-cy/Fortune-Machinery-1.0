import UniversalCard from './UniversalCard';

export default function CategoryCard({ category, onClick }) {
  return (
    <UniversalCard
      item={category}
      type="category"
      onClick={onClick}
    />
  );
}