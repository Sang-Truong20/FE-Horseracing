import React, { useState, useEffect } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { SearchOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Select, Spin, Alert, message } from "antd";
import { Eye, Edit, Trash2, Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../config/axios";

const ADMIN_USERS_API = "/api/admin/users";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterRole !== "all") params.role = filterRole;
      if (filterStatus !== "all") params.status = filterStatus;
      const response = await api.get(ADMIN_USERS_API, { params });
      const payload = response.data?.data ?? response.data ?? [];
      const resolvedUsers = Array.isArray(payload)
        ? payload
        : payload.users ?? payload.items ?? [];
      setUsers(resolvedUsers);
    } catch (fetchError) {
      console.error("Fetch users error:", fetchError);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const filteredUsers = users.filter((user) => {
    const searchString = `${user.name ?? ""} ${user.email ?? ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const getRoleBadge = (role) => {
    const badges = {
      Owner: "bg-purple-500/20 text-purple-300",
      Jockey: "bg-blue-500/20 text-blue-300",
      Admin: "bg-red-500/20 text-red-300",
    };
    return badges[role] || "bg-gray-500/20 text-gray-300";
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Hoạt Động": "bg-green-500/20 text-green-300",
      "Chờ Xác Minh": "bg-yellow-500/20 text-yellow-300",
      "Bị Khóa": "bg-red-500/20 text-red-300",
    };
    return badges[status] || "bg-gray-500/20 text-gray-300";
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
    });
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formValues = await form.validateFields();
      const updateData = {
        fullName: formValues.name,
        phone: formValues.phone,
        address: formValues.address,
        status: formValues.status,
      };

      const response = await api.put(`${ADMIN_USERS_API}/${selectedUser.id}`, updateData);
      
      // Cập nhật users list
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: formValues.name,
                phone: formValues.phone,
                address: formValues.address,
                status: formValues.status,
              }
            : user
        )
      );
      
      setIsEditModalVisible(false);
      message.success("Cập nhật thông tin người dùng thành công!");
    } catch (error) {
      console.error("Update user error:", error);
      message.error(error.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}" không?`)) {
      // TODO: call API delete
      alert("Xóa người dùng thành công!");
    }
  };

  const handleLockUser = async (user) => {
    // TODO: call API lock/unlock account
    alert(`Khóa/Mở khóa tài khoản "${user.name}" thành công!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Quản Lý Người Dùng</h1>
          <p className="text-gray-400 mt-2">Quản lý toàn bộ người dùng trong hệ thống</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tìm kiếm</label>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Tên hoặc email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Vai trò</label>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tất cả</option>
              <option value="Owner">Owner</option>
              <option value="Jockey">Jockey</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tất cả</option>
              <option value="Hoạt Động">Hoạt Động</option>
              <option value="Chờ Xác Minh">Chờ Xác Minh</option>
              <option value="Bị Khóa">Bị Khóa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">&nbsp;</label>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
                setFilterStatus("all");
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {error && <Alert message={error} type="error" showIcon className="bg-gray-800 border-gray-700 text-white" />} 

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold">Danh Sách Người Dùng</h2>
            <span className="text-sm text-gray-400">{filteredUsers.length} kết quả</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              <Spin /> Đang tải dữ liệu...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGƯỜI DÙNG</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">VAI TRÒ</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TRẠNG THÁI</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">NGÀY THAM GIA</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">SỐ DƯ VÍ</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                          <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white">
                                {user.name?.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => handleEditUser(user)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEditUser(user); }}
                                className="cursor-pointer"
                              >
                                <p className="font-semibold text-gray-900 hover:underline">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{user.joinDate || user.createdAt || "-"}</td>
                          <td className="px-6 py-4 text-sm font-semibold">₫{user.balance ?? 0}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleViewUser(user)} className="p-2 hover:bg-gray-600 rounded-lg transition text-blue-400" title="Xem chi tiết">
                                <Eye size={18} />
                              </button>
                              <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-gray-600 rounded-lg transition text-yellow-400" title="Chỉnh sửa">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleLockUser(user)} className="p-2 hover:bg-gray-600 rounded-lg transition text-orange-400" title="Khóa/Mở khóa">
                                {user.status === "Bị Khóa" ? <Unlock size={18} /> : <Lock size={18} />}
                              </button>
                              <button onClick={() => handleDeleteUser(user)} className="p-2 hover:bg-gray-600 rounded-lg transition text-red-400" title="Xóa">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          Không tìm thấy người dùng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Hiển thị {filteredUsers.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} / {filteredUsers.length} người dùng
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === index + 1 ? "bg-purple-500 text-white" : "hover:bg-gray-700"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    {totalPages > 5 && <span className="text-gray-400">...</span>}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title={`Chi tiết người dùng: ${selectedUser?.name}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        bodyStyle={{ backgroundColor: '#ffffff', color: '#111827', padding: '20px' }}
        style={{ top: 20 }}
        className="rounded-lg"
      >
        {selectedUser && (
          <div className="space-y-4 text-gray-900">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên</p>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điện thoại</p>
                <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-semibold text-gray-900">{selectedUser.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vai trò</p>
                <p className="font-semibold text-gray-900">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className="font-semibold text-gray-900">{selectedUser.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số dư ví</p>
                <p className="font-semibold text-gray-900">₫{selectedUser.balance ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tham gia</p>
                <p className="font-semibold text-gray-900">{selectedUser.joinDate ?? selectedUser.createdAt ?? "-"}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`Chỉnh sửa người dùng: ${selectedUser?.name || 'Người dùng'}`}
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        bodyStyle={{ backgroundColor: '#ffffff', color: '#111827', padding: '20px' }}
        style={{ top: 20 }}
        className="rounded-lg"
      >
        <Form form={form} layout="vertical" className="mt-4 text-gray-900">
          <Form.Item label={<span className="text-gray-700">Tên</span>} name="name">
            <Input 
              placeholder="Nhập tên" 
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', fontSize: '16px', height: '40px' }}
            />
          </Form.Item>
          <Form.Item label={<span className="text-gray-700">Email</span>} name="email">
            <Input 
              type="email" 
              placeholder="Email" 
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', fontSize: '16px', height: '40px' }}
              disabled 
            />
          </Form.Item>
          <Form.Item label={<span className="text-gray-700">Điện thoại</span>} name="phone">
            <Input 
              placeholder="Nhập số điện thoại" 
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', fontSize: '16px', height: '40px' }}
            />
          </Form.Item>
          <Form.Item label={<span className="text-gray-700">Địa chỉ</span>} name="address">
            <Input 
              placeholder="Nhập địa chỉ" 
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', fontSize: '16px', height: '40px' }}
            />
          </Form.Item>
          <Form.Item label={<span className="text-gray-700">Vai trò</span>} name="role">
            <Select 
              placeholder="Chọn vai trò" 
              options={[{ label: "Owner", value: "Owner" }, { label: "Jockey", value: "Jockey" }, { label: "Admin", value: "Admin" }]}
              style={{ height: '40px', color: '#111827' }}
            />
          </Form.Item>
          <Form.Item label={<span className="text-gray-700">Trạng thái</span>} name="status">
            <Select 
              placeholder="Chọn trạng thái" 
              options={[{ label: "Hoạt Động", value: "Hoạt Động" }, { label: "Chờ Xác Minh", value: "Chờ Xác Minh" }, { label: "Bị Khóa", value: "Bị Khóa" }]}
              style={{ height: '40px', color: '#111827' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;
