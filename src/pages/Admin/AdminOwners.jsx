import React from "react";
import AdminLayout from "../../layout/AdminLayout";

const AdminOwners = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản Lý Chủ Ngựa</h1>
          <p className="text-gray-400 mt-2">Quản lý xác minh và kiểm duyệt chủ ngựa</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400">Tính năng này đang được phát triển...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOwners;
