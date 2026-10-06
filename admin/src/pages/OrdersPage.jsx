import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';
import Status from '../components/Status';
export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const load = () =>
    adminApi
      .orders()
      .then(({ orders }) => setOrders(orders))
      .catch(() => setOrders([]));
  useEffect(() => {
    void load();
  }, []);
  const update = (id, status) => adminApi.updateOrder(id, status).then(load);
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Orders</h2>
          <p>Only successfully created orders appear here.</p>
        </div>
      </div>
      {orders === null ? (
        <div className="table-loading">Loading orders…</div>
      ) : !orders.length ? (
        <EmptyAdminState
          title="No orders yet"
          text="Orders will arrive here after the checkout is configured and customers purchase published products."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Method</th>
                <th>Payment</th>
                <th>Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>
                    {o.customer?.name}
                    <small>{o.customer?.email}</small>
                  </td>
                  <td>₹{o.total}</td>
                  <td>{o.paymentMethod === 'razorpay' ? 'Razorpay' : 'COD'}</td>
                  <td>
                    <Status>{o.paymentState}</Status>
                  </td>
                  <td>
                    <select
                      value={o.fulfillmentStatus}
                      onChange={(e) => update(o._id, e.target.value)}
                    >
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
