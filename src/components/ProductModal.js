'use client';
// Đây là popup form: create product + edit product

import { useEffect, useMemo, useState } from 'react';

export default function ProductModal({
  isOpen,       // trạng thái mở/đóng modal
  mode = 'create', // 'create' hoặc 'edit'
  initialData = {}, // dữ liệu cũ khi edit
  loading = false, // trạng thái loading khi submit form
  categories = [], // danh sách danh mục từ parent
  onSubmit, // hàm gọi khi submit form, nhận vào object { title, author, description, image_url, price, stock, category_id }
  onClose // hàm gọi khi đóng modal
}) {

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    stock: '',
    category_id: '',
    description: '',
    image_url: ''
  });

  const [error, setError] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const canUploadToCloudinary = useMemo(
    () => Boolean(cloudinaryCloudName && cloudinaryUploadPreset),
    [cloudinaryCloudName, cloudinaryUploadPreset]
  );

  // useEffect reset form :reset form khi mở modal + đổ dữ liệu cũ vào form khi edit
  useEffect(() => {
    if (isOpen) {

      queueMicrotask(() => {
        if (mode === 'edit' && initialData !== null && initialData !== undefined) {
          // fill dữ liệu cũ vào input
          setFormData({
            title: initialData.title || '',
            author: initialData.author || '',
            price: initialData.price || '',
            stock: initialData.stock || '',
            category_id: initialData.category_id || '',
            description: initialData.description || '',
            image_url: initialData.image_url || ''
          });
        } else {
          setFormData({
            title: '',
            author: '',
            price: '',
            stock: '',
            category_id: '',
            description: '',
            image_url: ''
          });
        }
        setError({}); //reset error về rỗng
        setImageFile(null);
        setImagePreview('');
        setUploadError('');
      });
    }

  }, [isOpen, initialData, mode]) // mỗi khi mở modal hoặc dữ liệu cũ thay đổi thì reset formData

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  //  =======================khi user nhập input -> update formData =========================
  const handleChange = (e) => {
    const { name, value } = e.target;  //<input name="title" />
    setFormData(prev => ({
      ...prev, //Giữ dữ liệu cũ.
      [name]: value  //[name] : dynamic key, sẽ là title, author, price,... tùy input nào thay đổi
    }));

    // Xóa error khi user nhập vào trường đó
    if (error[name]) {
      setError(prev => ({
        ...prev,
        [name]: '' //xóa lỗi của trường đang nhập
      }));
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setUploadError('');
    setImagePreview(file ? URL.createObjectURL(file) : '');

    if (file && error.image_url) {
      setError((prev) => ({
        ...prev,
        image_url: '',
      }));
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) {
      return formData.image_url;
    }

    if (!canUploadToCloudinary) {
      throw new Error('Thiếu cấu hình Cloudinary. Hãy thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
    }

    const uploadData = new FormData();
    uploadData.append('file', imageFile);
    uploadData.append('upload_preset', cloudinaryUploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadData,
      }
    );

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error?.message || 'Upload hình ảnh thất bại');
    }

    const payload = await response.json();
    return payload.secure_url;
  };


  // ======================kiểm tra form hợp lệ trước khi submit======================
  const validateForm = () => {
    const newError = {};

    // Title - Required, max 255
    if (!formData.title.trim()) {
      newError.title = 'Tên sách không được để trống';
    } else if (formData.title.length > 255) {
      newError.title = 'Tên sách không được vượt quá 255 ký tự';
    }

    // Author - Required, max 150
    if (!formData.author.trim()) {
      newError.author = 'Tác giả không được để trống';
    } else if (formData.author.length > 150) {
      newError.author = 'Tác giả không được vượt quá 150 ký tự';
    }

    // Price - Required, >= 1000
    if (!formData.price) {
      newError.price = 'Giá không được để trống';
    } else if (isNaN(formData.price) || parseInt(formData.price) < 1000) {
      newError.price = 'Giá phải >= 1000';
    }

    // Stock - Required, >= 0
    if (formData.stock === '') {
      newError.stock = 'Kho hàng không được để trống';
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newError.stock = 'Kho hàng phải >= 0';
    }

    // Category - Required
    if (!formData.category_id) {
      newError.category_id = 'Danh mục không được để trống';
    }

    // Description - Required
    if (!formData.description.trim()) {
      newError.description = 'Mô tả không được để trống';
    }

    // Image - Required: either upload file or paste URL
    if (!formData.image_url.trim() && !imageFile) {
      newError.image_url = 'Vui lòng tải ảnh lên hoặc nhập link hình ảnh';
    }

    setError(newError);
    return Object.keys(newError).length === 0;
  }


  // ======================khi submit form======================
  const handleSubmit = (e) => {
    e.preventDefault(); // ngăn form submit reload page

    if (!validateForm()) {
      return; // nếu form không hợp lệ thì dừng submit
    }

    try {
      const runSubmit = async () => {
        setUploadingImage(true);
        try {
          const imageUrl = imageFile ? await uploadImageToCloudinary() : formData.image_url.trim();
          await onSubmit(
            {
              ...formData,
              image_url: imageUrl,
            },
            initialData?.id
          ); //gọi hàm submit từ props, truyền dữ liệu form + id lên
        } catch (err) {
          console.error('Error submitting form:', err);
          setUploadError(err.message || 'Không thể upload ảnh');
        } finally {
          setUploadingImage(false);
        }
      };

      runSubmit();
    } catch (err) {
      console.error('Error submitting form:', err);
      // có thể set lỗi chung ở đây nếu onSubmit ném lỗi
    }
  }

  // render modal UI
  if (!isOpen) return null; // nếu modal đóng thì không render gì


  // tạo biến title và buttonText tùy theo mode để hiển thị khác nhau giữa create và edit
  const title = mode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm';
  const buttonText = mode === 'create' ? 'Tạo Sản Phẩm' : 'Lưu Thay Đổi';
  const isBusy = loading || uploadingImage;
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 text-2xl transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Sách <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isBusy}
              placeholder="Nhập tên sách..."
              className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${error.title ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {error.title && <p className="text-red-500 text-sm mt-1">⚠️ {error.title}</p>}
          </div>

          {/* Author - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tác Giả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              disabled={isBusy}
              placeholder="Nhập tác giả..."
              className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${error.author ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {error.author && <p className="text-red-500 text-sm mt-1"> {error.author}</p>}
          </div>

          {/* Price & Stock - 2 cột */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={isBusy}
                placeholder="1000"
                min="1000"
                className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${error.price ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {error.price && <p className="text-red-500 text-sm mt-1">⚠️ {error.price}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kho Hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                disabled={isBusy}
                placeholder="0"
                min="0"
                className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${error.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {error.stock && <p className="text-red-500 text-sm mt-1">⚠️ {error.stock}</p>}
            </div>
          </div>

          {/* Category - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh Mục <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={isBusy}
              className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${
                error.category_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => {
                const id = c.id ?? c.value ?? c.category_id;
                const name = c.name || c.title || c.label || c.category_name;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
            {error.category_id && <p className="text-red-500 text-sm mt-1">⚠️ {error.category_id}</p>}
          </div>

          {/* Description - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô Tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isBusy}
              placeholder="Nhập mô tả sản phẩm..."
              rows="3"
              className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${
                error.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error.description && <p className="text-red-500 text-sm mt-1">⚠️ {error.description}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình Ảnh <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isBusy}
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">
              Tải ảnh lên Cloudinary để tự lấy link.{' '}
              {!canUploadToCloudinary && 'Hiện chưa cấu hình Cloudinary nên bạn vẫn có thể dán link thủ công bên dưới.'}
            </p>
            {(imagePreview || formData.image_url) && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview || formData.image_url}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              disabled={isBusy}
              placeholder="Hoặc dán link ảnh nếu cần"
              className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition ${
                error.image_url ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error.image_url && <p className="text-red-500 text-sm mt-1">⚠️ {error.image_url}</p>}
            {uploadError && <p className="text-red-500 text-sm mt-1">⚠️ {uploadError}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium transition"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isBusy}
              display="block"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium transition flex items-center gap-2"
            >
              {isBusy && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </>
  );

}