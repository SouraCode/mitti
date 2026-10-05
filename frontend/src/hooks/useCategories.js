import { useEffect, useState } from 'react';
import { categoriesApi } from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let active = true;
    categoriesApi.list().then(({ categories: list }) => {
      if (active)
        setCategories(
          Array.isArray(list)
            ? list.filter((category) => category && typeof category === 'object' && category.name)
            : []
        );
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return categories;
}
