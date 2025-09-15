import React, { useState, useEffect } from 'react';
import { useDavizClient, useOrderManager } from '../hooks/useDavizClient';
import { useWallet } from '@solana/wallet-adapter-react';
import type { InterestOrder } from '../lib/anchor-client';

export const ConsultantDashboard: React.FC = () => {
  const client = useDavizClient();
  const orderManager = useOrderManager();
  const { connected } = useWallet();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<InterestOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<InterestOrder[]>([]);
  const [assetDetails, setAssetDetails] = useState<Map<string, any>>(new Map());

  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'createdAt',
  });

  const [selectedOrder, setSelectedOrder] = useState<InterestOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Load orders and asset details
  useEffect(() => {
    if (connected) {
      loadOrders();
    }
  }, [connected]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...orders];

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = orderManager.getAllOrders();
      setOrders(allOrders);

      // Load asset details for each order
      if (client) {
        const assetMap = new Map();
        const uniqueAssetPdas = [...new Set(allOrders.map(order => order.assetPda))];

        for (const assetPda of uniqueAssetPdas) {
          try {
            const asset = await client.program.account.assetProfile.fetch(assetPda);
            assetMap.set(assetPda, {
              publicKey: assetPda,
              account: asset,
            });
          } catch (error) {
            console.log('Could not fetch asset:', assetPda);
          }
        }

        setAssetDetails(assetMap);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: InterestOrder['status']) => {
    orderManager.updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: InterestOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const accepted = orders.filter(o => o.status === 'accepted').length;
    const completed = orders.filter(o => o.status === 'completed').length;

    return { total, pending, accepted, completed };
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Consultant Dashboard</h2>
        <p className="text-gray-600 mb-8">
          Connect your wallet to manage client orders and projects.
        </p>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Consultant Dashboard</h2>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-gray-600">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
          <p className="text-gray-600">Pending</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-blue-600">{stats.accepted}</h3>
          <p className="text-gray-600">Accepted</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
          <p className="text-gray-600">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date Created</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* No Orders */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {orders.length === 0
              ? 'No orders yet. Buyers will see your services when they place interest orders.'
              : 'No orders match your current filters.'
            }
          </p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const asset = assetDetails.get(order.assetPda);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset?.account.name || 'Unknown Asset'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.assetPda.slice(0, 8)}...{order.assetPda.slice(-8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.buyerAddress.slice(0, 8)}...{order.buyerAddress.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>

                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'accepted')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {order.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business</h4>
                <p className="text-gray-700">
                  {assetDetails.get(selectedOrder.assetPda)?.account.name || 'Unknown Asset'}
                </p>
                <p className="text-sm text-gray-500">
                  PDA: {selectedOrder.assetPda}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Buyer</h4>
                <p className="text-gray-700">{selectedOrder.buyerAddress}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedOrder.message}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <p className="text-gray-700">{selectedOrder.contactInfo}</p>
              </div>

              {selectedOrder.budget && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                  <p className="text-gray-700">{selectedOrder.budget}</p>
                </div>
              )}

              {selectedOrder.timeline && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                  <p className="text-gray-700">{selectedOrder.timeline}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                <p className="text-gray-700">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'accepted');
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'cancelled');
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Decline Order
                  </button>
                </>
              )}

              {selectedOrder.status === 'accepted' && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedOrder.id, 'completed');
                    setShowOrderDetails(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              )}

              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};