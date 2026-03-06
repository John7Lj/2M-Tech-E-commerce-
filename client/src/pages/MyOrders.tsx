import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/common/BackBtn';
import { useMyOrdersQuery } from '../redux/api/order.api';

const MyOrders: React.FC = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useMyOrdersQuery('');

    if (isLoading) {
        return <p className="text-center text-lg">Loading...</p>;
    }

    if (isError || !data) {
        return <p className="text-center text-lg text-red-500">Error loading orders</p>;
    }

    return (
        <div className="container mx-auto mt-20 mb-8 p-4 bg-white rounded-lg shadow-md">
            <BackButton />
            <h2 className="text-2xl font-bold mb-6 text-center">My Orders</h2>
            {data.orders.length === 0 ? (
                <p className="text-center text-lg">No orders found</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/5 font-black uppercase tracking-widest text-[10px]">
                                <th className="p-4 text-sm md:text-base">Order ID</th>
                                <th className="p-4 text-sm md:text-base">Date</th>
                                <th className="p-4 text-sm md:text-base">Status</th>
                                <th className="p-4 text-sm md:text-base">Total</th>
                                <th className="p-4 text-sm md:text-base">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.orders.map((order) => (
                                <tr className="border-b hover:bg-gray-100" key={order._id}>
                                    <td className="p-4 text-sm md:text-base">{order._id}</td>
                                    <td className="p-4 text-sm md:text-base">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm md:text-base">{order.status}</td>
                                    <td className="p-4 text-sm md:text-base">${order.total.toFixed(2)}</td>
                                    <td className="p-4">
                                        <button
                                            className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                                            onClick={() => navigate(`/order/${order._id}`)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
