import { useEffect, useState } from 'react';
import { productsApi } from '../services/api';

export function useProducts(filters) {
  const [state, setState] = useState({ loading: true, products: [], error: '' });
  useEffect(() => {
    let current = true;
    setState((s) => ({ ...s, loading: true }));
    productsApi
      .list(filters)
      .then(
        (data) => current && setState({ loading: false, products: data.products || [], error: '' })
      )
      .catch(() => current && setState({ loading: false, products: [], error: '' }));
    return () => {
      current = false;
    };
  }, [JSON.stringify(filters)]);
  return state;
}
