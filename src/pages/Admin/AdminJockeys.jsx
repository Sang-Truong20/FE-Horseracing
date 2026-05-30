import React from "react";
import AdminLayout from "../../layout/AdminLayout";

const AdminJockeys = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Cấp Phép Jockey</h1>
          <p className="text-gray-400 mt-2">Duyệt và quản lý giấy phép jockey</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400">Tính năng này đang được phát triển...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJockeys;
