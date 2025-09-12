// src/hooks/useCompanies.js
import { useState, useEffect, useCallback } from 'react';
import * as companyAPI from '../services/companyAPI';
import { message } from 'antd';

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);

  // Define fetchCompanies outside of useEffect
  const fetchCompanies = useCallback(async () => {
    try {
      // Use the correct import from companyAPI
      const response = await companyAPI.getCompanies();
      setCompanies(response.data);
    } catch (error) {
      setError(error);
      const errorMessage = error.response?.data?.error || 'Không thể tải danh sách công ty. Vui lòng kiểm tra quyền truy cập.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]); // useEffect will now call the memoized fetchCompanies function

  const addCompany = async (companyData) => {
    try {
      await companyAPI.createCompany(companyData);
      message.success('Tạo mới công ty thành công!');
      fetchCompanies(); // This call will now work correctly
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Tạo mới thất bại. Vui lòng kiểm tra lại thông tin và quyền truy cập.';
      message.error(errorMessage);
    }
  };

  const editCompany = async (id, companyData) => {
    try {
      await companyAPI.updateCompany(id, companyData);
      message.success('Cập nhật công ty thành công!');
      fetchCompanies(); // This call will now work correctly
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin và quyền truy cập.';
      message.error(errorMessage);
    }
  };

  const removeCompany = async (id) => {
    try {
      await companyAPI.deleteCompany(id);
      message.success('Xóa công ty thành công!');
      fetchCompanies(); // This call will now work correctly
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Xóa thất bại. Vui lòng kiểm tra lại quyền truy cập.';
      message.error(errorMessage);
    }
  };

  return { companies, loading, addCompany, editCompany, removeCompany };
};